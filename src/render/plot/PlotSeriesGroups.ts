import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

export default class PlotSeriesGroups {
    readonly enabledSeries: PlotSeries[]

    readonly barSeries: PlotSeries[]

    readonly verticalSeries: PlotSeries[]

    readonly isHorizontal: boolean

    private readonly indexes: Map<PlotSeries, number>

    constructor(series: PlotSeries[]) {
        this.enabledSeries = series.filter(item => !item.disabled)
        this.barSeries = series.filter(item => item.type == PlotType.Bar)
        this.verticalSeries = series.filter(item => item.type != PlotType.Bar && item.type != PlotType.AttentionLine)
        this.isHorizontal = series.length > 0 && this.barSeries.length == series.length
        this.indexes = new Map(series.map((item, index) => [item, index]))
    }

    get hasBars() {
        return this.barSeries.length > 0
    }

    indexOf(series: PlotSeries) {
        return this.indexes.get(series) ?? -1
    }
}