import PlotSeries from '@/types/PlotSeries'
import PlotPoint, { getPointKeys } from '@/types/PlotPoint'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import { AnimationTiming, DEFAULT_LINE_WIDTH, Layer } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { AREA_LAYER, CAP_LAYER, LINE_LAYER } from '@/render/plot/PlotConstants'
import { CapMarks } from '@/render/plot/PlotCapMarks'
import { ThemePalette } from '@/Theme'
import { PlotType } from '@/static/Enums'

const CAP_CARET_WIDTH = 2

export type ValueTooltip = (series: PlotSeries, value: PlotPoint) => string

export default class PlotItemStyle {
    private readonly pointKeys = new Map<PlotSeries, string[]>()

    constructor(
        private readonly layout: PlotLayout,
        private readonly seriesGroups: PlotSeriesGroups,
        readonly getValueTooltip: ValueTooltip,
        private readonly theme: ThemePalette
    ) {
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
                         .tooltip(() => this.getValueTooltip(series, value))
                         .data(value.data)
                         .contextMenu()

        this.groupHover(item, series)

        if (this.seriesGroups.isDisabled(series))
            item.ghost()

        return item
    }

    styleLine(line: QueueLineItemBuilder, series: PlotSeries, suffix: string) {
        line.width(series.width ?? DEFAULT_LINE_WIDTH)
            .color(series.color)
            .layer(series.type === PlotType.Area ? AREA_LAYER : LINE_LAYER)
            .key(this.getKey(series, suffix))
            .interact()
            .init(AnimationTiming.plotLineInit)

        this.groupHover(line, series)
    }

    styleCapMarks({ fade, caret, value }: CapMarks, series: PlotSeries, slot: number, valueIndex: number) {
        const pointKey = this.getPointKey(series, valueIndex)
        const delay = AnimationTiming.plotInit + slot * this.initStagger

        fade.color(this.theme.canvasBackground)
            .layer(CAP_LAYER)
            .key(this.getKey(series, 'cap-fade', pointKey))
            .init(AnimationTiming.plotCapInit, delay, true)

        caret.width(CAP_CARET_WIDTH)
             .color(series.color)
             .layer(CAP_LAYER)
             .key(this.getKey(series, 'cap-caret', pointKey))
             .init(AnimationTiming.plotCapInit, delay, true)

        value?.layer(CAP_LAYER)
              .key(this.getKey(series, 'cap-value', pointKey))
              .init(AnimationTiming.plotCapInit, delay, true)
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