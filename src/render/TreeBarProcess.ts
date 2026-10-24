import TreeBarData, { flattenTreeBarRows, getCellNumber, getTreeBarTotal, TreeBarColumn, TreeBarEntry } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import RectangleDimensions from '@/types/RectangleDimensions'
import type { PanelScroll } from '@/types/Panel'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { maxOf } from '@/helpers/Collections'
import { clamp } from '@/helpers/Geometry'
import { short, stringWidth } from '@/helpers/Text'
import { withAlpha } from '@/helpers/Color'
import ChartProcess from '@/render/ChartProcess'
import Theme from '@/Theme'

const HEADER_HEIGHT = 32

const ROW_MIN_HEIGHT = 36

const ROW_PADDING = 6

const LINE_HEIGHT = 15

const PADDING = 8

const SCROLLBAR_SPACE = 8

const GAP = 16

const COLUMN_GAP = 16

const INDENT = 16

const TOGGLE_WIDTH = 16

const TOGGLE_SIZE = 3.5

const TOGGLE_LINE_WIDTH = 1.5

const IMAGE_SIZE = 24

const IMAGE_GAP = 8

const LABEL_FONT = 12

const SUB_LABEL_FONT = 11

const HEADER_FONT = 12

const CELL_FONT = 12

const BAR_LABEL_FONT = 11

const BAR_HEIGHT = 16

const BAR_RADIUS = 3

const BAR_LABEL_GAP = 6

const NAME_MIN_WIDTH = 80

const NAME_MAX_SHARE = .35

const COLUMN_MAX_SHARE = .15

const TICKS = 5

const MUTED_ALPHA = .6

const IMAGE_PLACEHOLDER_ALPHA = .1

const TRANSPARENT = '#00000000'

const ROW_APPEAR_DELAY = AnimationTiming.rebuild / 2

const GRID_WIDTH = 1

const SORT_ASCENDING = ' ▲'

const SORT_DESCENDING = ' ▼'

type Row = TreeBarEntry & {
    y: number
    height: number
}

type Column = TreeBarColumn & {
    left: number
    right: number
    width: number
}

type Line = {
    text: string
    isSubLabel: boolean
}

export default class TreeBarProcess extends ChartProcess<TreeBarData> {
    private readonly width: number

    private readonly right: number

    private readonly rows: Row[] = []

    private readonly height: number

    private readonly nameWidth: number

    private readonly columns: Column[]

    private readonly bar: { x: number, width: number }

    private readonly barLabelWidth: number

    private readonly ticks: number[]

    private readonly scale: number

    constructor(data: TreeBarData, pixel: Point, settings: ProcessSettings) {
        super(data, pixel, settings)

        const all = flattenTreeBarRows(data.values)

        this.width = this.units.toPxX(COORDS_MAX_X)
        this.right = this.width - PADDING - SCROLLBAR_SPACE
        this.nameWidth = this.getNameWidth(all)
        this.columns = this.getColumns(all)
        this.barLabelWidth = maxOf(all, ({ node }) => node.barLabel ? stringWidth(node.barLabel, BAR_LABEL_FONT) + BAR_LABEL_GAP : 0)
        this.bar = this.getBar()

        this.ticks = getRoundedValues(all.map(({ node }) => getTreeBarTotal(node)), TICKS)
        this.scale = this.ticks[this.ticks.length - 1] || 1

        let y = HEADER_HEIGHT

        for (const entry of this.getVisible(data.values)) {
            const height = TreeBarProcess.getRowHeight(entry.node)

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
        return [this.getHeader()]
    }

    getData(): QueueAction[] {
        return this.rows.map(row => this.getRow(row))
    }

    private static getLines(node: TreeBarRow): Line[] {
        const lines = node.label.split('\n').map(text => ({ text, isSubLabel: false }))

        return node.subLabel ? [...lines, { text: node.subLabel, isSubLabel: true }] : lines
    }

    private static getLineFont(line: Line) {
        return line.isSubLabel ? SUB_LABEL_FONT : LABEL_FONT
    }

    private static getRowHeight(node: TreeBarRow) {
        return Math.max(ROW_MIN_HEIGHT, TreeBarProcess.getLines(node).length * LINE_HEIGHT + ROW_PADDING * 2)
    }

    private static getTextOffset(node: TreeBarRow) {
        return TOGGLE_WIDTH + (node.image ? IMAGE_SIZE + IMAGE_GAP : 0)
    }

    private static formatCell(value: string | number | undefined) {
        return typeof value == 'number' ? short(value, false) : value ?? ''
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

    private getNameWidth(all: TreeBarEntry[]) {
        const width = maxOf(all, ({ node, level }) => {
            const text = maxOf(TreeBarProcess.getLines(node), line => stringWidth(line.text, TreeBarProcess.getLineFont(line)))

            return level * INDENT + TreeBarProcess.getTextOffset(node) + text
        })

        return clamp(width, Math.min(NAME_MIN_WIDTH, this.width * NAME_MAX_SHARE), this.width * NAME_MAX_SHARE)
    }

    private getColumns(all: TreeBarEntry[]): Column[] {
        let right = this.right

        return [...this.data.columns ?? []].reverse().map(column => {
            const width = Math.min(Math.max(
                stringWidth(column.title + SORT_ASCENDING, HEADER_FONT),
                maxOf(all, ({ node }) => stringWidth(TreeBarProcess.formatCell(node.cells?.[column.key]), CELL_FONT))
            ), this.width * COLUMN_MAX_SHARE)

            const result = { ...column, left: right - width, right, width }

            right -= width + COLUMN_GAP

            return result
        }).reverse()
    }

    private getBar() {
        const x = PADDING + this.nameWidth + GAP
        const end = this.columns.length > 0 ? this.columns[0].left - GAP : this.right

        return { x, width: Math.max(end - this.barLabelWidth - x, 0) }
    }

    private getVisible(rows: TreeBarRow[], level: number = 0): TreeBarEntry[] {
        return this.sort(rows).flatMap(node => [
            { node, level },
            ...(node.expanded && node.children ? this.getVisible(node.children, level + 1) : [])
        ])
    }

    private sort(rows: TreeBarRow[]): TreeBarRow[] {
        const { sortColumn: key, sortDescending: isDescending } = this.data

        if (key == undefined)
            return rows

        const isMissing = (value: string | number | undefined) => value == undefined || value === ''

        const compare = (a: TreeBarRow, b: TreeBarRow) => {
            const first = a.cells?.[key]
            const second = b.cells?.[key]

            if (isMissing(first) || isMissing(second))
                return +isMissing(first) - +isMissing(second)

            const x = getCellNumber(first)
            const y = getCellNumber(second)

            const result = Number.isFinite(x) && Number.isFinite(y)
                           ? x - y
                           : String(first).localeCompare(String(second), undefined, { numeric: true })

            return isDescending ? -result : result
        }

        return [...rows].sort(compare)
    }

    private getSortIndicator(key: string) {
        if (this.data.sortColumn != key)
            return ''

        return this.data.sortDescending ? SORT_DESCENDING : SORT_ASCENDING
    }

    private getHeader(): QueueAction {
        const bodyBottom = this.y(Math.min(this.height, this.units.toPxY(COORDS_MAX_Y)))

        return (items: QueueItemsBuilder) => {
            for (const tick of this.ticks) {
                const x = this.x(this.bar.x + tick / this.scale * this.bar.width)

                items.text(short(tick, false))
                     .position(x, this.y(HEADER_HEIGHT / 2))
                     .size(HEADER_FONT)
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
                items.text(column.title + this.getSortIndicator(column.key))
                     .position(this.x(column.right), this.y(HEADER_HEIGHT / 2))
                     .size(HEADER_FONT)
                     .align(TextAlignment.Right)
                     .clip(this.x(column.width))
                     .key(`tree-bar-column-${ column.key }`)

                this.clickArea(items, `tree-bar-column-${ column.key }-area`, {
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
    }

    private getRow({ node, level, y, height }: Row): QueueAction {
        const key = `tree-bar-row-${ node.id }`
        const center = y + height / 2
        const left = PADDING + level * INDENT

        return (items: QueueItemsBuilder) => {
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
                this.getToggle(items, key, node, left + TOGGLE_WIDTH / 2, center, {
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

            this.getLabels(items, key, node, left + TreeBarProcess.getTextOffset(node), center)
            this.getBarParts(items, key, node, center)

            for (const column of this.columns)
                items.text(TreeBarProcess.formatCell(node.cells?.[column.key]))
                     .position(this.x(column.right), this.y(center))
                     .size(CELL_FONT)
                     .align(TextAlignment.Right)
                     .clip(this.x(column.width))
                     .appearDelay(ROW_APPEAR_DELAY)
                     .key(`${ key }-cell-${ column.key }`)
        }
    }

    private getToggle(items: QueueItemsBuilder, key: string, node: TreeBarRow, x: number, y: number, area: RectangleDimensions) {
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

        this.clickArea(items, `${ key }-toggle-area`, area, () => {
            node.expanded = !node.expanded

            this.onChange?.()
        })
    }

    private getLabels(items: QueueItemsBuilder, key: string, node: TreeBarRow, x: number, center: number) {
        const lines = TreeBarProcess.getLines(node)
        const width = PADDING + this.nameWidth - x

        lines.forEach((line, index) => {
            const text = items.text(line.text)
                              .position(this.x(x), this.y(center + (index - (lines.length - 1) / 2) * LINE_HEIGHT))
                              .size(TreeBarProcess.getLineFont(line))
                              .align(TextAlignment.Left)
                              .clip(this.x(width))
                              .appearDelay(ROW_APPEAR_DELAY)
                              .key(`${ key }-label-${ index }`)

            if (line.isSubLabel)
                text.color(TreeBarProcess.mutedText)
        })
    }

    private getBarParts(items: QueueItemsBuilder, key: string, node: TreeBarRow, center: number) {
        const parts = node.parts.filter(part => part.value > 0)
        const total = getTreeBarTotal(node)
        const unit = this.bar.width / this.scale
        const top = center - BAR_HEIGHT / 2

        const box = {
            x: this.x(this.bar.x),
            y: this.y(top),
            width: this.x(total * unit),
            height: this.y(BAR_HEIGHT)
        }

        let x = this.bar.x

        parts.forEach((part, index) => {
            const partKey = `${ key }-part-${ index }`
            const width = part.value * unit

            items.rect()
                 .box(this.units, { x, y: top, width, height: BAR_HEIGHT })
                 .clip(box, this.x(BAR_RADIUS))
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
                 .position(this.x(this.bar.x + total * unit + BAR_LABEL_GAP), this.y(center))
                 .size(BAR_LABEL_FONT)
                 .align(TextAlignment.Left)
                 .clip(this.x(this.barLabelWidth))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ key }-bar-label`)
    }

    private clickArea(items: QueueItemsBuilder, key: string, area: RectangleDimensions, action: () => void) {
        items.rect()
             .box(this.units, area)
             .fill()
             .color(TRANSPARENT)
             .layer(Layer.Base)
             .key(key)
             .onClick(action)
    }

    private sortBy(key: string) {
        if (this.data.sortColumn == key) {
            this.data.sortDescending = !this.data.sortDescending
        } else {
            this.data.sortColumn = key
            this.data.sortDescending = false
        }

        this.onChange?.()
    }
}
