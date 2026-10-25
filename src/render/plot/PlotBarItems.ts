import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'

export default class PlotBarItems {
    private readonly layout: PlotLayout

    private readonly style: PlotItemStyle

    private readonly seriesGroups: PlotSeriesGroups

    constructor(layout: PlotLayout, style: PlotItemStyle, seriesGroups: PlotSeriesGroups) {
        this.layout = layout
        this.style = style
        this.seriesGroups = seriesGroups
    }

    getItems(series: PlotSeries) {
        const { layout, seriesGroups } = this
        const { barSeries } = seriesGroups
        const { categoryScale, valueScale, baseline } = layout.horizontal

        return (items: QueueItemsBuilder) => {
            const step = categoryScale.step

            const visibleBefore = barSeries.slice(0, barSeries.indexOf(series)).filter(bar => !bar.disabled).length
            const heightInStep = step / Math.max(barSeries.filter(bar => !bar.disabled).length, 1)
            const height = series.disabled ? 0 : heightInStep

            const offset = visibleBefore * heightInStep

            series.values.forEach(value => {
                const slot = categoryScale.getSlot(value)
                const y = categoryScale.getSlotStart(slot) - offset
                const length = seriesGroups.isHorizontal ? layout.capToYMax(Number(value.y)) : Number(value.y)

                const bar = items.rect()
                     .position(baseline, y)
                     .size(series.disabled ? 0 : length * valueScale.lengthPerUnit, height)
                     .round([0, CORNER_RADIUS, CORNER_RADIUS, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', baseline)

                this.style.styleRect(bar, series, value, slot)
            })
        }
    }
}