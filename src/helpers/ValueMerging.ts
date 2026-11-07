import { groupBy } from '@/helpers/Collections'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import Value from '@/types/base/Value'
import Sector from '@/types/Sector'
import PlotSeries from '@/types/PlotSeries'
import PlotPoint, { getY } from '@/types/PlotPoint'
import PieData from '@/types/data/PieData'
import GaugeData from '@/types/data/GaugeData'
import PlotData from '@/types/data/PlotData'
import TreeData, { TreeValue } from '@/types/data/TreeData'

export function mergeSameLabelValues(chart: ChartItem) {
    if (!chart.data?.values)
        return

    if (chart.type == ChartType.Pie || chart.type == ChartType.Gauge)
        mergeSectors(chart.data as PieData | GaugeData)
    else if (chart.type == ChartType.TreeMap)
        mergeTreeValues(chart.data as TreeData)
    else if (chart.type == ChartType.Plot)
        mergeSeries(chart.data as PlotData)
}

function mergeSectors(data: PieData | GaugeData) {
    if (data.enableMerging === false)
        return

    data.values = mergeByLabel(data.values, addValue)
}

function mergeTreeValues(data: TreeData) {
    if (data.enableMerging === false)
        return

    data.values = mergeByLabel(data.values, addTreeValue)

    for (const value of data.values)
        if (value.sectors)
            value.sectors = mergeByLabel(value.sectors, addValue)
}

function mergeSeries(data: PlotData) {
    if (data.enableMerging)
        data.values = mergeByLabel(data.values, addPoints)
}

function mergeByLabel<T extends Value>(values: T[], merge: (target: T, source: T) => void) {
    const groups = groupBy(values, value => value.label || value)

    return [...groups.values()].map(([target, ...sources]) => {
        for (const source of sources) {
            merge(target, source)

            target.color ||= source.color
        }

        return target
    })
}

function addValue(target: Value, source: Value) {
    target.value = (target.value ?? 0) + (source.value ?? 0)
}

function addTreeValue(target: TreeValue, source: TreeValue) {
    if (target.sectors?.length || source.sectors?.length) {
        target.sectors = toSectors(target)

        for (const sector of toSectors(source))
            target.sectors.push(sector)
    }

    addValue(target, source)
}

function toSectors(value: TreeValue): Value[] {
    if (value.sectors?.length)
        return value.sectors

    return [new Sector({ label: value.label, value: value.value, color: value.color, data: value.data })]
}

function addPoints(target: PlotSeries, source: PlotSeries) {
    target.values ??= []

    const pointsByX = new Map(target.values.map(point => [point.x.toString(), point]))

    for (const point of source.values ?? []) {
        const x = point.x.toString()
        const pointAtSameX = pointsByX.get(x)

        if (pointAtSameX) {
            pointAtSameX.y = addY(pointAtSameX, point)
        } else {
            target.values.push(point)
            pointsByX.set(x, point)
        }
    }
}

function addY(first: PlotPoint, second: PlotPoint) {
    const firstY = getY(first)
    const secondY = getY(second)

    if (firstY == null || secondY == null)
        return firstY ?? secondY

    return firstY + secondY
}