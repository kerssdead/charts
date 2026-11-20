import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment, Axis } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { ColumnGroup, getColumnGroup, getStackKey, getStackTops } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'
import { addColumnCapMarks } from '@/render/plot/PlotCapMarks'
import { getStackOutlines, StackOutline } from '@/render/plot/PlotStackOutlines'
import RectangleDimensions from '@/types/RectangleDimensions'

type StackedColumn = {
    valueIndex: number
    slot: number
    x: number
    y: number
    width: number
    height: number
    isTop: boolean
    isCapped: boolean
    total: number
    clip: RectangleDimensions | null
}

export default class PlotStackedColumnItems {
    private readonly layout: PlotLayout

    private readonly style: PlotItemStyle

    private readonly seriesGroups: PlotSeriesGroups

    private readonly columnGroups: Map<string, ColumnGroup>

    private readonly stackTops: Map<string, PlotSeries>

    private readonly outlines: Map<string, StackOutline>

    constructor(
        layout: PlotLayout,
        style: PlotItemStyle,
        seriesGroups: PlotSeriesGroups,
        columnGroups: Map<string, ColumnGroup>
    ) {
        this.layout = layout
        this.style = style
        this.seriesGroups = seriesGroups
        this.columnGroups = columnGroups
        this.stackTops = getStackTops(seriesGroups.enabledSeries, layout.yMax)
        this.outlines = getStackOutlines(layout, seriesGroups.enabledSeries)
    }

    getItems(series: PlotSeries, stacks: Map<string, number>) {
        const stacked = this.stackColumns(series, stacks)

        return (items: QueueItemsBuilder) => this.addColumns(items, series, stacked)
    }

    private stackColumns(series: PlotSeries, stacks: Map<string, number>): StackedColumn[] {
        const { layout } = this
        const { categoryScale, valueScale, baseline } = layout.vertical
        const step = categoryScale.step
        const isDisabled = this.seriesGroups.isDisabled(series)

        return series.values.flatMap((value, valueIndex) => {
            const y = getY(value)

            if (!valueScale.canShow(y))
                return []

            const slot = categoryScale.getSlot(value)

            const { columns, slots } = getColumnGroup(this.columnGroups, value)
            const width = step / slots
            const offset = columns.length * width

            const key = getStackKey(value)
            const stack = stacks.get(key) ?? 0
            const top = isDisabled ? stack : stack + y
            const bottomY = stack === 0 ? baseline : valueScale.getCoordinate(layout.capToYMax(stack))
            const topY = isDisabled ? bottomY : valueScale.getCoordinate(layout.capToYMax(top))

            stacks.set(key, top)

            const x = categoryScale.getSlotStart(slot) + offset

            return [{
                valueIndex,
                slot,
                x,
                y: bottomY,
                width,
                height: bottomY - topY,
                isTop: this.stackTops.get(key) === series,
                isCapped: !isDisabled && layout.isAboveYMax(top) && !layout.isAboveYMax(stack),
                total: top,
                clip: this.getClip(key, x, width)
            }]
        })
    }

    private getClip(key: string, x: number, width: number): RectangleDimensions | null {
        const outline = this.outlines.get(key)

        if (!outline?.needsClip)
            return null

        const { baseline } = this.layout.vertical
        const { units } = this.layout
        const overshoot = units.y(units.toPxX(CORNER_RADIUS))
        const isNegative = outline.far > baseline
        const start = isNegative ? baseline - overshoot : outline.far
        const end = isNegative ? outline.far : baseline + overshoot

        return { x, y: start, width, height: end - start }
    }

    private addColumns(
        items: QueueItemsBuilder,
        series: PlotSeries,
        stacked: StackedColumn[]
    ) {
        const { layout } = this
        const { baseline } = layout.vertical

        for (const { valueIndex, slot, x, y, width, height, isTop, isCapped, total, clip } of stacked) {
            const column = items.rect()
                 .position(x, y)
                 .size(width, height)
                 .collapse(false, true)
                 .round(isTop ? [CORNER_RADIUS, CORNER_RADIUS, 0, 0] : [0, 0, 0, 0])
                 .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                 .grow(Axis.Y, baseline)

            if (clip)
                column.clip(clip, CORNER_RADIUS)

            this.style.styleRect(column, series, slot, valueIndex)
                .fade(false)

            if (isCapped) {
                const marks = addColumnCapMarks(items, layout.units, {
                    span: { start: x, end: x + width },
                    edge: y - height,
                    value: total
                })

                this.style.styleCapMarks(marks, series, slot, valueIndex)
            }
        }
    }
}