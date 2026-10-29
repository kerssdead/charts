import PlotSeries from '@/types/PlotSeries'
import PlotPoint from '@/types/PlotPoint'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { AREA_LAYER, LINE_LAYER } from '@/render/plot/PlotConstants'
import { PlotType } from '@/static/Enums'

export type ValueTooltip = (series: PlotSeries, value: PlotPoint) => string

export default class PlotItemStyle {
    readonly getValueTooltip: ValueTooltip

    private readonly layout: PlotLayout

    private readonly seriesGroups: PlotSeriesGroups

    constructor(layout: PlotLayout, seriesGroups: PlotSeriesGroups, getValueTooltip: ValueTooltip) {
        this.layout = layout
        this.seriesGroups = seriesGroups
        this.getValueTooltip = getValueTooltip
    }

    styleRect(rect: QueueRectangleItemBuilder, series: PlotSeries, value: PlotPoint, index: number) {
        const item = rect.fill()
                         .gradient()
                         .color(series.color)
                         .layer(Layer.Data)
                         .key(this.getKey(series, 'rect', index))
                         .interact()
                         .init(AnimationTiming.plotInit, index * this.initStagger)
                         .tooltip(this.getValueTooltip(series, value))
                         .data(value.data)
                         .contextMenu()

        this.groupHover(item, series)

        if (series.disabled)
            item.ghost()

        return item
    }

    styleLine(line: QueueLineItemBuilder, series: PlotSeries, suffix: string) {
        line.width(series.width)
            .color(series.color)
            .layer(series.type == PlotType.Area ? AREA_LAYER : LINE_LAYER)
            .key(this.getKey(series, suffix))
            .interact()
            .init(AnimationTiming.plotLineInit)

        this.groupHover(line, series)
    }

    private get initStagger() {
        const { vertical, horizontal } = this.layout
        const slots = Math.max(vertical.categoryScale.count, horizontal.categoryScale.count, 1)

        return Math.min(AnimationTiming.plotInitStagger, AnimationTiming.plotInitStaggerTotal / slots)
    }

    private groupHover(item: QueueItemBaseBuilder, series: PlotSeries) {
        if (this.seriesGroups.enabledSeries.length > 1)
            item.hoverGroup(this.getKey(series))
    }

    private getKey(series: PlotSeries, ...parts: (string | number)[]) {
        return [this.seriesGroups.indexOf(series), ...parts].join('-')
    }
}