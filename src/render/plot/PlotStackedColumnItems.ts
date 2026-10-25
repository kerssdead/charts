import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { ColumnGroup, getColumnGroup, getStackKey, getStackTops } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'

export default class PlotStackedColumnItems {
    private readonly layout: PlotLayout

    private readonly style: PlotItemStyle

    private readonly columnGroups: Map<string, ColumnGroup>

    private readonly stackTops: Map<string, PlotSeries>

    constructor(
        layout: PlotLayout,
        style: PlotItemStyle,
        seriesGroups: PlotSeriesGroups,
        columnGroups: Map<string, ColumnGroup>
    ) {
        this.layout = layout
        this.style = style
        this.columnGroups = columnGroups
        this.stackTops = getStackTops(seriesGroups.enabledSeries)
    }

    getItems(series: PlotSeries, stacks: Map<string, number>) {
        const { layout } = this
        const { categoryScale, valueScale, baseline } = layout.vertical
        const step = categoryScale.step
        const lengthPerUnit = valueScale.lengthPerUnit

        const stacked = series.values.map(value => {
            const slot = categoryScale.getSlot(value)

            const { columns, slots } = getColumnGroup(this.columnGroups, value)
            const width = step / slots
            const offset = columns.length * width

            const key = getStackKey(value)
            const stack = stacks.get(key) ?? 0
            const room = layout.yMax == undefined ? Infinity : Math.max(layout.yMax * lengthPerUnit + stack, 0)
            const height = series.disabled ? 0 : Math.min(Number(value.y) * lengthPerUnit, room)

            stacks.set(key, stack - height)

            return {
                value,
                slot,
                x: categoryScale.getSlotStart(slot) + offset,
                y: baseline + stack,
                width,
                height,
                isTop: this.stackTops.get(key) === series
            }
        })

        return (items: QueueItemsBuilder) => {
            for (const { value, slot, x, y, width, height, isTop } of stacked) {
                const column = items.rect()
                     .position(x, y)
                     .size(width, height)
                     .collapse(false, true)
                     .round(isTop ? [CORNER_RADIUS, CORNER_RADIUS, 0, 0] : [0, 0, 0, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('y', baseline)

                this.style.styleRect(column, series, value, slot)
                    .fade(false)
            }
        }
    }
}