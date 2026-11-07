import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { ColumnGroup, getColumnGroup, getStackKey, getStackTops } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'
import { addColumnBreakMark } from '@/render/plot/PlotBreakMarks'

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
        this.stackTops = getStackTops(seriesGroups.enabledSeries, layout.yMax)
    }

    getItems(series: PlotSeries, stacks: Map<string, number>) {
        const { layout } = this
        const { categoryScale, valueScale, baseline } = layout.vertical
        const step = categoryScale.step

        const stacked = series.values.flatMap((value, valueIndex) => {
            const y = getY(value)

            if (!valueScale.canShow(y))
                return []

            const slot = categoryScale.getSlot(value)

            const { columns, slots } = getColumnGroup(this.columnGroups, value)
            const width = step / slots
            const offset = columns.length * width

            const key = getStackKey(value)
            const stack = stacks.get(key) ?? 0
            const top = series.disabled ? stack : stack + y
            const bottomY = stack == 0 ? baseline : valueScale.getCoordinate(layout.capToYMax(stack))
            const topY = series.disabled ? bottomY : valueScale.getCoordinate(layout.capToYMax(top))

            stacks.set(key, top)

            return [{
                value,
                valueIndex,
                slot,
                x: categoryScale.getSlotStart(slot) + offset,
                y: bottomY,
                width,
                height: bottomY - topY,
                isTop: this.stackTops.get(key) === series,
                hasBreakMark: !series.disabled && layout.isAboveYMax(top) && !layout.isAboveYMax(stack)
            }]
        })

        return (items: QueueItemsBuilder) => {
            for (const { value, valueIndex, slot, x, y, width, height, isTop, hasBreakMark } of stacked) {
                const column = items.rect()
                     .position(x, y)
                     .size(width, height)
                     .collapse(false, true)
                     .round(isTop ? [CORNER_RADIUS, CORNER_RADIUS, 0, 0] : [0, 0, 0, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('y', baseline)

                this.style.styleRect(column, series, value, slot, valueIndex)
                    .fade(false)

                if (hasBreakMark) {
                    const mark = addColumnBreakMark(items, layout.units, x, x + width, y - height)

                    this.style.styleBreakMark(mark, series, slot, valueIndex)
                }
            }
        }
    }
}