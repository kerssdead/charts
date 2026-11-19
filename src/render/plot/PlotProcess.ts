import PlotData from '@/types/data/PlotData'
import PlotSeries from '@/types/PlotSeries'
import PlotPoint from '@/types/PlotPoint'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import ValueAxis from '@/types/ValueAxis'
import ChartProcess from '@/render/ChartProcess'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotTitles from '@/render/plot/PlotTitles'
import PlotAxes from '@/render/plot/PlotAxes'
import PlotSeriesItems from '@/render/plot/PlotSeriesItems'
import ChartViewState from '@/types/ChartViewState'

export default class PlotProcess extends ChartProcess<PlotData> {
    private readonly seriesGroups: PlotSeriesGroups

    private readonly layout: PlotLayout

    private readonly titles: PlotTitles

    private readonly axes: PlotAxes

    private readonly seriesItems: PlotSeriesItems

    constructor(data: PlotData, pixel: Point, settings: ProcessSettings, state: ChartViewState) {
        super(data, pixel, settings, state)

        this.seriesGroups = new PlotSeriesGroups(data.values, state.isDisabled)
        this.layout = new PlotLayout(data, this.units, this.seriesGroups)
        this.titles = new PlotTitles(data, this.units, this.layout)
        this.axes = new PlotAxes(data, this.units, this.layout, this.theme)
        this.seriesItems = new PlotSeriesItems(
            data.values,
            this.layout,
            (series, value) => this.getValueTooltip(series, value),
            this.theme
        )
    }

    get isHorizontal() {
        return this.seriesGroups.isHorizontal
    }

    getAxisY(value: number) {
        return this.layout.vertical.valueScale.getCoordinate(value)
    }

    getAxisValue(y: number) {
        return this.layout.vertical.valueScale.getValue(y)
    }

    getValueAxis(): ValueAxis {
        return this
    }

    isEmpty() {
        return !this.seriesGroups.enabledSeries.some(series => series.values.length)
    }

    getData() {
        return [this.titles.getItems(), this.axes.getItems(), ...this.seriesItems.getItems()]
    }

    private getValueTooltip(series: PlotSeries, value: PlotPoint) {
        return this.tooltip(
            series.label,
            value.label ?? this.layout.formatX(value.x),
            this.formatValue(value.y ?? '')
        )
    }
}