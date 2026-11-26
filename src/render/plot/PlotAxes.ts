import PlotData from '@/types/data/PlotData'
import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotAxisLabels from '@/render/plot/PlotAxisLabels'
import PlotAxisLines from '@/render/plot/PlotAxisLines'
import { ThemePalette } from '@/Theme'

export default class PlotAxes {
    private readonly labels: PlotAxisLabels

    private readonly lines: PlotAxisLines

    constructor(private readonly data: PlotData, units: Units, layout: PlotLayout, theme: ThemePalette) {
        this.labels = new PlotAxisLabels(data, units, layout, layout.seriesGroups)
        this.lines = new PlotAxisLines(layout, layout.seriesGroups, theme)
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