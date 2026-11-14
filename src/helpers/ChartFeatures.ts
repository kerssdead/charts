import ChartItem from '@/types/ChartItem'
import { ChartType } from '@/static/Enums'

export function hasLegend(chart: ChartItem) {
    return chart.type !== ChartType.Gauge
           && chart.type !== ChartType.SegmentedBar
           && chart.type !== ChartType.TreeBar
           && (chart.type !== ChartType.TreeMap || (chart.data?.values?.length ?? 0) > 1)
}