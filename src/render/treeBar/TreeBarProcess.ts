import TreeBarData, { flattenTreeBarRows, getTreeBarTotal } from '@/types/data/TreeBarData'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import type { PanelScroll } from '@/types/Panel'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { maxOf } from '@/helpers/Collections'
import { short, stringWidth } from '@/helpers/Text'
import ChartProcess from '@/render/ChartProcess'
import Theme from '@/Theme'
import * as TreeBarLayout from '@/render/treeBar/TreeBarLayout'
import * as TreeBarRowText from '@/render/treeBar/TreeBarRowText'
import * as TreeBarSorting from '@/render/treeBar/TreeBarSorting'
import TreeBarRowItems, { TreeBarGeometry, TreeBarRowEntry } from '@/render/treeBar/TreeBarRowItems'
import { addClickArea, getMutedTextColor } from '@/render/treeBar/TreeBarItems'
import {
    BAR_LABEL_FONT_SIZE,
    BAR_LABEL_GAP,
    HEADER_FONT_SIZE,
    HEADER_HEIGHT,
    PADDING,
    SCROLLBAR_SPACE,
    TICKS
} from '@/render/treeBar/TreeBarConstants'

export default class TreeBarProcess extends ChartProcess<TreeBarData> {
    private readonly rows: TreeBarRowEntry[] = []

    private readonly height: number

    private readonly geometry: TreeBarGeometry

    private readonly ticks: number[]

    private readonly rowItems: TreeBarRowItems

    constructor(data: TreeBarData, pixel: Point, settings: ProcessSettings) {
        super(data, pixel, settings)

        const allEntries = flattenTreeBarRows(data.values)

        const width = this.units.toPxX(COORDS_MAX_X)
        const contentRight = width - PADDING - SCROLLBAR_SPACE

        const nameWidth = TreeBarLayout.getNameWidth(allEntries, width)
        const columns = TreeBarLayout.getColumns(data.columns ?? [], allEntries, contentRight, width)
        const barLabelWidth = Math.max(maxOf(allEntries, ({ node }) => {
            return node.barLabel ? stringWidth(node.barLabel, BAR_LABEL_FONT_SIZE) + BAR_LABEL_GAP : 0
        }), 0)

        this.ticks = getRoundedValues(allEntries.map(({ node }) => getTreeBarTotal(node)), TICKS)
        this.geometry = {
            width,
            nameWidth,
            columns,
            barArea: TreeBarLayout.getBarArea(nameWidth, columns, contentRight, barLabelWidth),
            barLabelWidth,
            maxTickValue: this.ticks[this.ticks.length - 1] || 1
        }
        this.rowItems = new TreeBarRowItems(this.units, this.geometry, settings.imageCrossOrigin, {
            getPartTooltip: (part, label) => this.valueTooltip(part, label, this.formatValue(part.value)),
            getPartData: part => TreeBarProcess.getItemData(part),
            onToggle: () => this.onChange?.()
        })

        let y = HEADER_HEIGHT

        for (const entry of TreeBarSorting.getVisibleEntries(data.values, data)) {
            const height = TreeBarRowText.getRowHeight(entry.node)

            this.rows.push({ ...entry, y, height })

            y += height
        }

        this.height = y
    }

    isEmpty() {
        return this.data.values.length === 0
    }

    getScroll(): PanelScroll {
        return { top: HEADER_HEIGHT, height: this.height }
    }

    getFixedData(): QueueAction[] {
        return [(items: QueueItemsBuilder) => this.addHeader(items)]
    }

    getData(): QueueAction[] {
        return this.rows.map(row => (items: QueueItemsBuilder) => this.rowItems.add(items, row))
    }

    private x(px: number) {
        return this.units.x(px)
    }

    private y(px: number) {
        return this.units.y(px)
    }

    private addHeader(items: QueueItemsBuilder) {
        const { barArea, maxTickValue, columns, width } = this.geometry
        const bodyBottom = this.y(Math.min(this.height, this.units.toPxY(COORDS_MAX_Y)))

        for (const tick of this.ticks) {
            const x = this.x(barArea.x + tick / maxTickValue * barArea.width)

            items.text(short(tick, false))
                 .position(x, this.y(HEADER_HEIGHT / 2))
                 .size(HEADER_FONT_SIZE)
                 .color(getMutedTextColor())
                 .key(`tree-bar-tick-${ tick }`)

            items.line()
                 .stop(x, this.y(HEADER_HEIGHT))
                 .stop(x, bodyBottom)
                 .color(Theme.lineAxis)
                 .layer(Layer.Base)
                 .key(`tree-bar-tick-line-${ tick }`)
        }

        for (const column of columns) {
            const sortIndicator = TreeBarSorting.getSortIndicator(
                column.key,
                this.data.sortColumn,
                this.data.sortDescending
            )

            items.text(column.title + sortIndicator)
                 .position(this.x(column.right), this.y(HEADER_HEIGHT / 2))
                 .size(HEADER_FONT_SIZE)
                 .align(TextAlignment.Right)
                 .clip(this.x(column.width))
                 .key(`tree-bar-column-${ column.key }`)

            addClickArea(items, this.units, {
                x: column.left,
                y: 0,
                width: column.width,
                height: HEADER_HEIGHT
            }, () => this.sortBy(column.key)).key(`tree-bar-column-${ column.key }-area`)
        }

        items.line()
             .stop(this.x(PADDING), this.y(HEADER_HEIGHT))
             .stop(this.x(width - PADDING), this.y(HEADER_HEIGHT))
             .color(Theme.lineAxis)
             .layer(Layer.Base)
             .key('tree-bar-header-line')
    }

    private sortBy(columnKey: string) {
        if (this.data.sortColumn === columnKey) {
            this.data.sortDescending = !this.data.sortDescending
        } else {
            this.data.sortColumn = columnKey
            this.data.sortDescending = false
        }

        this.onChange?.()
    }
}