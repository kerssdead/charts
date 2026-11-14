import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'
import { IsDisabled } from '@/types/ChartViewState'

export default class PlotSeriesGroups {
    readonly enabledSeries: PlotSeries[]

    readonly barSeries: PlotSeries[]

    readonly verticalSeries: PlotSeries[]

    readonly rendersBars: boolean

    readonly isHorizontal: boolean

    readonly hasOnlyBarSeries: boolean

    readonly isDisabled: IsDisabled

    private readonly indexes: Map<PlotSeries, number>

    constructor(series: PlotSeries[], isDisabled: IsDisabled) {
        this.isDisabled = isDisabled
        this.enabledSeries = series.filter(item => !isDisabled(item))
        this.barSeries = series.filter(item => item.type === PlotType.Bar)
        this.verticalSeries = series.filter(item => {
            return item.type !== PlotType.Bar && item.type !== PlotType.AttentionLine
        })

        const seriesWithValues = this.enabledSeries.filter(item => item.values.length > 0)
        const layoutSeries = seriesWithValues.length > 0 ? seriesWithValues : series

        this.rendersBars = layoutSeries.some(item => item.type === PlotType.Bar)
        this.isHorizontal = layoutSeries.length > 0 && layoutSeries.every(item => item.type === PlotType.Bar)
        this.hasOnlyBarSeries = series.length > 0 && this.barSeries.length === series.length
        this.indexes = new Map(series.map((item, index) => [item, index]))
    }

    indexOf(series: PlotSeries) {
        return this.indexes.get(series) ?? -1
    }
}