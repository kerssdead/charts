import ChartProcess from '@/render/ChartProcess'
import GaugeProcess from '@/render/gauge/GaugeProcess'
import PieProcess from '@/render/pie/PieProcess'
import PlotProcess from '@/render/plot/PlotProcess'
import TreeMapProcess from '@/render/tree/TreeMapProcess'
import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import Data from '@/types/interfaces/Data'

type ProcessConstructor = new (data: never, pixel: Point, settings: ChartSettings) => ChartProcess<Data>

export default class ProcessFactory {
    private static readonly processClasses = new Map<ChartType, ProcessConstructor>([
        [ChartType.Plot, PlotProcess],
        [ChartType.Pie, PieProcess],
        [ChartType.TreeMap, TreeMapProcess],
        [ChartType.Gauge, GaugeProcess],
        [ChartType.SegmentedBar, SegmentedBarProcess],
        [ChartType.TreeBar, TreeBarProcess]
    ])

    private static readonly fixedHeaderTypes = new Set([ChartType.TreeBar])

    static create(chart: ChartItem, pixel: Point, settings: ChartSettings) {
        const ProcessClass = ProcessFactory.processClasses.get(chart.type)

        return ProcessClass ? new ProcessClass(chart.data as never, pixel, settings) : undefined
    }

    static hasFixedHeader(type: ChartType) {
        return ProcessFactory.fixedHeaderTypes.has(type)
    }
}