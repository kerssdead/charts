import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'
import { addBarBreakMark } from '@/render/plot/PlotBreakMarks'

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

            series.values.forEach((value, valueIndex) => {
                const y = getY(value)

                if (!valueScale.canShow(y))
                    return

                const slot = categoryScale.getSlot(value)
                const bottom = categoryScale.getSlotStart(slot) - offset
                const length = seriesGroups.hasOnlyBarSeries ? layout.capToYMax(y) : y

                const end = valueScale.getCoordinate(length)

                const bar = items.rect()
                     .position(baseline, bottom)
                     .size(series.disabled ? 0 : end - baseline, height)
                     .round([0, CORNER_RADIUS, CORNER_RADIUS, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', baseline)

                this.style.styleRect(bar, series, value, slot, valueIndex)

                if (!series.disabled && seriesGroups.hasOnlyBarSeries && layout.isAboveYMax(y)) {
                    const mark = addBarBreakMark(items, layout.units, bottom - height, bottom, end)

                    this.style.styleBreakMark(mark, series, slot, valueIndex)
                }
            })
        }
    }
}