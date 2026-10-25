import PlotData from '@/types/data/PlotData'
import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotAxisLabels from '@/render/plot/PlotAxisLabels'
import PlotAxisLines from '@/render/plot/PlotAxisLines'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'

export default class PlotAxes {
    private readonly data: PlotData

    private readonly labels: PlotAxisLabels

    private readonly lines: PlotAxisLines

    constructor(data: PlotData, units: Units, layout: PlotLayout, seriesGroups: PlotSeriesGroups) {
        this.data = data
        this.labels = new PlotAxisLabels(data, units, layout, seriesGroups)
        this.lines = new PlotAxisLines(layout, seriesGroups)
    }

    getItems() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            this.labels.addItems(items)
            this.lines.addItems(items)
        }
    }
}