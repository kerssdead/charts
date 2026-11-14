import ChartDefinition from '@/charts/ChartDefinition'
import PlotDefinition from '@/charts/PlotDefinition'
import PieDefinition from '@/charts/PieDefinition'
import GaugeDefinition from '@/charts/GaugeDefinition'
import TreeMapDefinition from '@/charts/TreeMapDefinition'
import SegmentedBarDefinition from '@/charts/SegmentedBarDefinition'
import TreeBarDefinition from '@/charts/TreeBarDefinition'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import TableData from '@/types/TableData'
import Data from '@/types/interfaces/Data'
import PlotData from '@/types/data/PlotData'
import PieData from '@/types/data/PieData'
import GaugeData from '@/types/data/GaugeData'
import TreeData from '@/types/data/TreeData'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import TreeBarData from '@/types/data/TreeBarData'

type ChartDataByType = {
    [ChartType.Plot]: PlotData
    [ChartType.Pie]: PieData
    [ChartType.Gauge]: GaugeData
    [ChartType.TreeMap]: TreeData
    [ChartType.SegmentedBar]: SegmentedBarData
    [ChartType.TreeBar]: TreeBarData
}

const definitions: { [Type in ChartType]: ChartDefinition<ChartDataByType[Type]> } = {
    [ChartType.Plot]: PlotDefinition,
    [ChartType.Pie]: PieDefinition,
    [ChartType.Gauge]: GaugeDefinition,
    [ChartType.TreeMap]: TreeMapDefinition,
    [ChartType.SegmentedBar]: SegmentedBarDefinition,
    [ChartType.TreeBar]: TreeBarDefinition
}

export function getChartDefinition(type: ChartType): ChartDefinition<Data> | undefined {
    return definitions[type] as unknown as ChartDefinition<Data> | undefined
}

export function hasLegend(chart: ChartItem) {
    return getChartDefinition(chart.type)?.hasLegend(chart.data) ?? false
}

export function hasMenu(chart: ChartItem) {
    return getChartDefinition(chart.type)?.hasMenu ?? false
}

export function hasFixedHeader(chart: ChartItem) {
    return getChartDefinition(chart.type)?.hasFixedHeader ?? false
}

export function createProcess(chart: ChartItem, pixel: Point, settings: ChartSettings) {
    return getChartDefinition(chart.type)?.createProcess(chart.data, pixel, settings)
}

export function getTableRows(chart: ChartItem): TableData {
    return getChartDefinition(chart.type)?.getTableRows(chart.data) ?? { headers: [], values: [] }
}

export function summarizeTable(chart: ChartItem, table: TableData): TableData {
    return getChartDefinition(chart.type)?.summarizeTable?.(table) ?? table
}