import TreeBarData, { flattenTreeBarRows, getTreeBarTotal, TreeBarEntry } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import RectangleDimensions from '@/types/RectangleDimensions'
import type { PanelScroll } from '@/types/Panel'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { maxOf } from '@/helpers/Collections'
import { short, stringWidth } from '@/helpers/Text'
import { withAlpha } from '@/helpers/Color'
import ChartProcess from '@/render/ChartProcess'
import Theme from '@/Theme'
import * as TreeBarLayout from '@/render/treeBar/TreeBarLayout'
import * as TreeBarRowText from '@/render/treeBar/TreeBarRowText'
import * as TreeBarSorting from '@/render/treeBar/TreeBarSorting'
import { BarArea, Column } from '@/render/treeBar/TreeBarLayout'
import {
    BAR_HEIGHT,
    BAR_LABEL_FONT_SIZE,
    BAR_LABEL_GAP,
    BAR_RADIUS,
    CELL_FONT_SIZE,
    GRID_WIDTH,
    HEADER_FONT_SIZE,
    HEADER_HEIGHT,
    IMAGE_PLACEHOLDER_ALPHA,
    IMAGE_SIZE,
    INDENT,
    LINE_HEIGHT,
    MUTED_ALPHA,
    PADDING,
    ROW_APPEAR_DELAY,
    SCROLLBAR_SPACE,
    TICKS,
    TOGGLE_LINE_WIDTH,
    TOGGLE_SIZE,
    TOGGLE_WIDTH,
    TRANSPARENT
} from '@/render/treeBar/TreeBarConstants'

type Row = TreeBarEntry & {
    y: number
    height: number
}

export default class TreeBarProcess extends ChartProcess<TreeBarData> {
    private readonly width: number

    private readonly rows: Row[] = []

    private readonly height: number

    private readonly nameWidth: number

    private readonly columns: Column[]

    private readonly barArea: BarArea

    private readonly barLabelWidth: number

    private readonly ticks: number[]

    private readonly maxTickValue: number

    constructor(data: TreeBarData, pixel: Point, settings: ProcessSettings) {
        super(data, pixel, settings)

        const allEntries = flattenTreeBarRows(data.values)

        this.width = this.units.toPxX(COORDS_MAX_X)

        const contentRight = this.width - PADDING - SCROLLBAR_SPACE

        this.nameWidth = TreeBarLayout.getNameWidth(allEntries, this.width)
        this.columns = TreeBarLayout.getColumns(data.columns ?? [], allEntries, contentRight, this.width)
        this.barLabelWidth = maxOf(allEntries, ({ node }) => {
            return node.barLabel ? stringWidth(node.barLabel, BAR_LABEL_FONT_SIZE) + BAR_LABEL_GAP : 0
        })
        this.barArea = TreeBarLayout.getBarArea(this.nameWidth, this.columns, contentRight, this.barLabelWidth)

        this.ticks = getRoundedValues(allEntries.map(({ node }) => getTreeBarTotal(node)), TICKS)
        this.maxTickValue = this.ticks[this.ticks.length - 1] || 1

        let y = HEADER_HEIGHT

        for (const entry of TreeBarSorting.getVisibleEntries(data.values, data.sortColumn, data.sortDescending)) {
            const height = TreeBarRowText.getRowHeight(entry.node)

            this.rows.push({ ...entry, y, height })

            y += height
        }

        this.height = y
    }

    isEmpty() {
        return this.data.values.length == 0
    }

    getScroll(): PanelScroll {
        return { top: HEADER_HEIGHT, height: this.height }
    }

    getFixedData(): QueueAction[] {
        return [(items: QueueItemsBuilder) => this.addHeader(items)]
    }

    getData(): QueueAction[] {
        return this.rows.map(row => (items: QueueItemsBuilder) => this.addRow(items, row))
    }

    private static get mutedText() {
        return withAlpha(Theme.text, MUTED_ALPHA)
    }

    private x(px: number) {
        return this.units.x(px)
    }

    private y(px: number) {
        return this.units.y(px)
    }

    private addHeader(items: QueueItemsBuilder) {
        const bodyBottom = this.y(Math.min(this.height, this.units.toPxY(COORDS_MAX_Y)))

        for (const tick of this.ticks) {
            const x = this.x(this.barArea.x + tick / this.maxTickValue * this.barArea.width)

            items.text(short(tick, false))
                 .position(x, this.y(HEADER_HEIGHT / 2))
                 .size(HEADER_FONT_SIZE)
                 .color(TreeBarProcess.mutedText)
                 .key(`tree-bar-tick-${ tick }`)

            items.line()
                 .stop(x, this.y(HEADER_HEIGHT))
                 .stop(x, bodyBottom)
                 .color(Theme.lineAxis)
                 .layer(Layer.Base)
                 .key(`tree-bar-tick-line-${ tick }`)
        }

        for (const column of this.columns) {
            const sortIndicator = TreeBarSorting.getSortIndicator(column.key, this.data.sortColumn, this.data.sortDescending)

            items.text(column.title + sortIndicator)
                 .position(this.x(column.right), this.y(HEADER_HEIGHT / 2))
                 .size(HEADER_FONT_SIZE)
                 .align(TextAlignment.Right)
                 .clip(this.x(column.width))
                 .key(`tree-bar-column-${ column.key }`)

            this.addClickArea(items, `tree-bar-column-${ column.key }-area`, {
                x: column.left,
                y: 0,
                width: column.width,
                height: HEADER_HEIGHT
            }, () => this.sortBy(column.key))
        }

        items.line()
             .stop(this.x(PADDING), this.y(HEADER_HEIGHT))
             .stop(this.x(this.width - PADDING), this.y(HEADER_HEIGHT))
             .color(Theme.lineAxis)
             .layer(Layer.Base)
             .key('tree-bar-header-line')
    }

    private addRow(items: QueueItemsBuilder, { node, level, y, height }: Row) {
        const key = `tree-bar-row-${ node.id }`
        const center = y + height / 2
        const left = PADDING + level * INDENT

        items.rect()
             .box(this.units, { x: PADDING, y: y + height - GRID_WIDTH, width: this.width - PADDING * 2, height: GRID_WIDTH })
             .collapse(false, false)
             .fill()
             .color(Theme.lineAxis)
             .stroke(TRANSPARENT)
             .layer(Layer.Base)
             .appearDelay(ROW_APPEAR_DELAY)
             .key(`${ key }-line`)

        if (node.hasChildren)
            this.addToggle(items, key, node, left + TOGGLE_WIDTH / 2, center, {
                x: PADDING,
                y,
                width: this.nameWidth,
                height
            })

        if (node.image)
            items.image(node.image)
                 .position(this.x(left + TOGGLE_WIDTH + IMAGE_SIZE / 2), this.y(center))
                 .size(this.x(IMAGE_SIZE))
                 .color(withAlpha(Theme.text, IMAGE_PLACEHOLDER_ALPHA))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ key }-image`)

        this.addLabels(items, key, node, left + TreeBarRowText.getTextOffset(node), center)
        this.addBarParts(items, key, node, center)

        for (const column of this.columns)
            items.text(TreeBarRowText.formatCell(node.cells?.[column.key]))
                 .position(this.x(column.right), this.y(center))
                 .size(CELL_FONT_SIZE)
                 .align(TextAlignment.Right)
                 .clip(this.x(column.width))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ key }-cell-${ column.key }`)
    }

    private addToggle(
        items: QueueItemsBuilder,
        key: string,
        node: TreeBarRow,
        x: number,
        y: number,
        area: RectangleDimensions
    ) {
        const size = TOGGLE_SIZE

        const points = node.expanded
                       ? [[x - size, y - size / 2], [x, y + size / 2], [x + size, y - size / 2]]
                       : [[x - size / 2, y - size], [x + size / 2, y], [x - size / 2, y + size]]

        const line = items.line()

        for (const [px, py] of points)
            line.stop(this.x(px), this.y(py))

        line.width(TOGGLE_LINE_WIDTH)
            .color(TreeBarProcess.mutedText)
            .layer(Layer.Data)
            .appearDelay(ROW_APPEAR_DELAY)
            .key(`${ key }-toggle`)

        this.addClickArea(items, `${ key }-toggle-area`, area, () => {
            node.expanded = !node.expanded

            this.onChange?.()
        })
    }

    private addLabels(items: QueueItemsBuilder, key: string, node: TreeBarRow, x: number, center: number) {
        const lines = TreeBarRowText.getLines(node)
        const width = PADDING + this.nameWidth - x

        lines.forEach((line, index) => {
            const text = items.text(line.text)
                              .position(this.x(x), this.y(center + (index - (lines.length - 1) / 2) * LINE_HEIGHT))
                              .size(TreeBarRowText.getLineFontSize(line))
                              .align(TextAlignment.Left)
                              .clip(this.x(width))
                              .appearDelay(ROW_APPEAR_DELAY)
                              .key(`${ key }-label-${ index }`)

            if (line.isSubLabel)
                text.color(TreeBarProcess.mutedText)
        })
    }

    private addBarParts(items: QueueItemsBuilder, key: string, node: TreeBarRow, center: number) {
        const parts = node.parts.filter(part => part.value > 0)
        const total = getTreeBarTotal(node)
        const widthPerValue = this.barArea.width / this.maxTickValue
        const top = center - BAR_HEIGHT / 2

        const barBox = {
            x: this.x(this.barArea.x),
            y: this.y(top),
            width: this.x(total * widthPerValue),
            height: this.y(BAR_HEIGHT)
        }

        let x = this.barArea.x

        parts.forEach((part, index) => {
            const partKey = `${ key }-part-${ index }`
            const width = part.value * widthPerValue

            items.rect()
                 .box(this.units, { x, y: top, width, height: BAR_HEIGHT })
                 .clip(barBox, this.x(BAR_RADIUS))
                 .collapse(false, false)
                 .fill()
                 .color(part.color)
                 .layer(Layer.Data)
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(partKey)
                 .hoverGroup(partKey)
                 .monochrome()
                 .interact()
                 .contextMenu()
                 .tooltipHtml(this.valueTooltip(part, part.label || node.label.replace(/\n/g, ' '), this.formatValue(part.value)))
                 .data(TreeBarProcess.getItemData(part))

            x += width
        })

        if (node.barLabel)
            items.text(node.barLabel)
                 .position(this.x(this.barArea.x + total * widthPerValue + BAR_LABEL_GAP), this.y(center))
                 .size(BAR_LABEL_FONT_SIZE)
                 .align(TextAlignment.Left)
                 .clip(this.x(this.barLabelWidth))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ key }-bar-label`)
    }

    private addClickArea(items: QueueItemsBuilder, key: string, area: RectangleDimensions, action: () => void) {
        items.rect()
             .box(this.units, area)
             .fill()
             .color(TRANSPARENT)
             .layer(Layer.Base)
             .key(key)
             .onClick(action)
    }

    private sortBy(columnKey: string) {
        if (this.data.sortColumn == columnKey) {
            this.data.sortDescending = !this.data.sortDescending
        } else {
            this.data.sortColumn = columnKey
            this.data.sortDescending = false
        }

        this.onChange?.()
    }
}