import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { ColumnGroup, getColumnGroup } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'
import { addColumnBreakMark } from '@/render/plot/PlotBreakMarks'

export default class PlotColumnItems {
    private readonly layout: PlotLayout

    private readonly style: PlotItemStyle

    private readonly seriesGroups: PlotSeriesGroups

    private readonly columnGroups: Map<string, ColumnGroup>

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
    }

    getItems(series: PlotSeries) {
        const { layout } = this
        const { categoryScale, valueScale, baseline } = layout.vertical
        const step = categoryScale.step
        const index = this.seriesGroups.indexOf(series)

        return (items: QueueItemsBuilder) => {
            series.values.forEach((value, valueIndex) => {
                const y = getY(value)

                if (!valueScale.canShow(y))
                    return

                const slot = categoryScale.getSlot(value)

                const { columns, slots } = getColumnGroup(this.columnGroups, value)
                const visibleBefore = columns.filter(column => this.seriesGroups.indexOf(column) < index).length
                const widthInStep = step / slots
                const width = series.disabled ? 0 : widthInStep
                const offset = visibleBefore * widthInStep

                const left = categoryScale.getSlotStart(slot) + offset
                const top = valueScale.getCoordinate(layout.capToYMax(y))

                const column = items.rect()
                     .position(left + width / 2, baseline)
                     .size(width, series.disabled ? 0 : baseline - top)
                     .round([CORNER_RADIUS, CORNER_RADIUS, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .grow('y', baseline)

                this.style.styleRect(column, series, slot, valueIndex)

                if (!series.disabled && layout.isAboveYMax(y)) {
                    const mark = addColumnBreakMark(items, layout.units, { start: left, end: left + width }, top)

                    this.style.styleBreakMark(mark, series, slot, valueIndex)
                }
            })
        }
    }
}