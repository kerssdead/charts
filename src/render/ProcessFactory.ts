import ChartProcess from '@/render/ChartProcess'
import GaugeProcess from '@/render/GaugeProcess'
import PieProcess from '@/render/PieProcess'
import PlotProcess from '@/render/PlotProcess'
import TreeProcess from '@/render/TreeProcess'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import ChartSettings from '@/types/ChartSettings'
import GaugeData from '@/types/data/GaugeData'
import PieData from '@/types/data/PieData'
import PlotData from '@/types/data/PlotData'
import TreeData from '@/types/data/TreeData'
import Point from '@/types/Point'
import Data from '@/types/interfaces/Data'

type Factory = (chart: ChartItem, settings: ChartSettings, pixel: Point) => ChartProcess<Data>

export default class ProcessFactory {
    private static readonly factories = new Map<ChartType, Factory>([
        [ChartType.Plot, (chart, settings, pixel) =>
            new PlotProcess(chart.data as PlotData, pixel, settings.valuePostfix)],
        [ChartType.Pie, (chart, settings, pixel) =>
            new PieProcess(chart.data as PieData, pixel, settings.valuePostfix, settings.enableOther)],
        [ChartType.TreeMap, (chart, settings, pixel) =>
            new TreeProcess(chart.data as TreeData, pixel, settings.valuePostfix)],
        [ChartType.Gauge, (chart, settings, pixel) =>
            new GaugeProcess(chart.data as GaugeData, pixel, settings.valuePostfix)]
    ])

    static create(chart: ChartItem, settings: ChartSettings, pixel: Point) {
        return ProcessFactory.factories.get(chart.type)?.(chart, settings, pixel)
    }
}