import { QueueAction } from '@/builders/QueueItemsBuilder'
import GaugeProcess from '@/render/GaugeProcess'
import PieProcess from '@/render/PieProcess'
import PlotProcess from '@/render/PlotProcess'
import TreeProcess from '@/render/TreeProcess'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import GaugeData from '@/types/data/GaugeData'
import PieData from '@/types/data/PieData'
import PlotData from '@/types/data/PlotData'
import TreeData from '@/types/data/TreeData'
import Point from '@/types/Point'

type ProcessResult = {
    actions: QueueAction[]
    plot: PlotProcess | null
}

type Factory = (settings: ChartSettings, pixel: Point) => QueueAction[]

export default class ProcessFactory {
    private static readonly factories = new Map<ChartType, Factory>([
        [ChartType.Pie, (settings, pixel) =>
            new PieProcess(settings.data as PieData, pixel, settings.valuePostfix, settings.enableOther).getData()],
        [ChartType.TreeMap, (settings, pixel) =>
            new TreeProcess(settings.data as TreeData, pixel, settings.valuePostfix).getData()],
        [ChartType.Gauge, (settings, pixel) =>
            new GaugeProcess(settings.data as GaugeData, pixel, settings.valuePostfix).getData()]
    ])

    static create(settings: ChartSettings, pixel: Point): ProcessResult {
        if (settings.type == ChartType.Plot) {
            const plot = new PlotProcess(settings.data as PlotData, pixel, settings.valuePostfix)

            return { actions: [plot.getTitles(), plot.getBase(), ...plot.getData()], plot }
        }

        return { actions: ProcessFactory.factories.get(settings.type)?.(settings, pixel) ?? [], plot: null }
    }
}