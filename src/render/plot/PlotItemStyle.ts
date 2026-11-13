import PlotSeries from '@/types/PlotSeries'
import PlotPoint, { getPointKeys } from '@/types/PlotPoint'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { AREA_LAYER, BREAK_MARK_LAYER, LINE_LAYER } from '@/render/plot/PlotConstants'
import Theme from '@/Theme'
import { PlotType } from '@/static/Enums'

const BREAK_MARK_WIDTH = 3

export type ValueTooltip = (series: PlotSeries, value: PlotPoint) => string

export default class PlotItemStyle {
    readonly getValueTooltip: ValueTooltip

    private readonly layout: PlotLayout

    private readonly seriesGroups: PlotSeriesGroups

    private readonly pointKeys = new Map<PlotSeries, string[]>()

    constructor(layout: PlotLayout, seriesGroups: PlotSeriesGroups, getValueTooltip: ValueTooltip) {
        this.layout = layout
        this.seriesGroups = seriesGroups
        this.getValueTooltip = getValueTooltip
    }

    styleRect(rect: QueueRectangleItemBuilder, series: PlotSeries, slot: number, valueIndex: number) {
        const value = series.values[valueIndex]
        const item = rect.fill()
                         .gradient()
                         .color(series.color)
                         .layer(Layer.Data)
                         .key(this.getKey(series, 'rect', this.getPointKey(series, valueIndex)))
                         .interact()
                         .init(AnimationTiming.plotInit, slot * this.initStagger)
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
            .layer(series.type === PlotType.Area ? AREA_LAYER : LINE_LAYER)
            .key(this.getKey(series, suffix))
            .interact()
            .init(AnimationTiming.plotLineInit)

        this.groupHover(line, series)
    }

    styleBreakMark(line: QueueLineItemBuilder, series: PlotSeries, slot: number, valueIndex: number) {
        line.width(BREAK_MARK_WIDTH)
            .stroke(Theme.canvasBackground)
            .layer(BREAK_MARK_LAYER)
            .key(this.getKey(series, 'break', this.getPointKey(series, valueIndex)))
            .init(AnimationTiming.plotBreakInit, AnimationTiming.plotInit + slot * this.initStagger, true)
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

    private getPointKey(series: PlotSeries, valueIndex: number) {
        const keys = this.pointKeys.get(series) ?? getPointKeys(series.values)

        this.pointKeys.set(series, keys)

        return keys[valueIndex]
    }

    private getKey(series: PlotSeries, ...parts: (string | number)[]) {
        return [series.id, ...parts].join('-')
    }
}