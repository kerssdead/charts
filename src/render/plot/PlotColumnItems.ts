import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { ColumnGroup, getColumnGroup } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'

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
            series.values.forEach(value => {
                const slot = categoryScale.getSlot(value)

                const { columns, slots } = getColumnGroup(this.columnGroups, value)
                const visibleBefore = columns.filter(column => this.seriesGroups.indexOf(column) < index).length
                const widthInStep = step / slots
                const width = series.disabled ? 0 : widthInStep
                const offset = visibleBefore * widthInStep

                const column = items.rect()
                     .position(categoryScale.getSlotStart(slot) + offset + width / 2, baseline)
                     .size(
                         width,
                         series.disabled ? 0 : layout.capToYMax(Number(value.y)) * valueScale.lengthPerUnit
                     )
                     .round([CORNER_RADIUS, CORNER_RADIUS, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .grow('y', baseline)

                this.style.styleRect(column, series, value, slot)
            })
        }
    }
}