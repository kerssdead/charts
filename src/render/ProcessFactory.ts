import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import GaugeProcess from 'render/GaugeProcess'
import PieProcess from 'render/PieProcess'
import PlotProcess from 'render/PlotProcess'
import TreeProcess from 'render/TreeProcess'
import { ChartType } from 'static/Enums'
import ChartSettings from 'types/ChartSettings'
import GaugeData from 'types/data/GaugeData'
import PieData from 'types/data/PieData'
import PlotData from 'types/data/PlotData'
import TreeData from 'types/data/TreeData'
import Point from 'types/Point'

export type QueueAction = (items: QueueItemsBuilder) => void

type ProcessResult = {
    actions: QueueAction[]
    plot: PlotProcess | null
}

type Factory = (settings: ChartSettings, pixel: Point) => ProcessResult

export default class ProcessFactory {
    private static readonly factories = new Map<ChartType, Factory>([
        [ChartType.Plot, (settings: ChartSettings, pixel: Point) => {
            const plot = new PlotProcess(settings.data as PlotData, pixel, settings)

            return {
                actions: [plot.getTitles(settings.title), plot.getBase(), ...plot.getData()],
                plot
            }
        }],
        [ChartType.Pie, (settings: ChartSettings, pixel: Point) => {
            return {
                actions: new PieProcess(settings.data as PieData, pixel, settings).getData(),
                plot: null
            }
        }],
        [ChartType.TreeMap, (settings: ChartSettings) => {
            return {
                actions: new TreeProcess(settings.data as TreeData).getData(),
                plot: null
            }
        }],
        [ChartType.Gauge, (settings: ChartSettings) => {
            return {
                actions: new GaugeProcess(settings.data as GaugeData).getData(),
                plot: null
            }
        }]
    ])

    static create(settings: ChartSettings, pixel: Point): ProcessResult {
        const factory = ProcessFactory.factories.get(settings.type)

        return factory
               ? factory(settings, pixel)
               : { actions: [], plot: null }
    }
}