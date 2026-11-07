import PlotSeries from '@/types/PlotSeries'
import PlotPoint, { getY } from '@/types/PlotPoint'
import { PlotType } from '@/static/Enums'

export type ColumnGroup = {
    columns: PlotSeries[]
    hasStacking: boolean
}

export function getStackKey(value: PlotPoint) {
    return `${ value.x.toString() }${ (getY(value) ?? 0) < 0 ? '-' : '+' }`
}

export function getStackTops(series: PlotSeries[], yMax: number = Infinity) {
    const stackTops = new Map<string, PlotSeries>()
    const totals = new Map<string, number>()

    for (const stackedSeries of series.filter(item => item.type == PlotType.StackingColumn)) {
        for (const value of stackedSeries.values) {
            const key = getStackKey(value)
            const y = getY(value)
            const total = totals.get(key) ?? 0

            if (y == null)
                continue

            if (y != 0 && total < yMax)
                stackTops.set(key, stackedSeries)

            totals.set(key, total + y)
        }
    }

    return stackTops
}

export function getColumnGroups(series: PlotSeries[]) {
    const groups = new Map<string, ColumnGroup>()

    const isColumn = (item: PlotSeries) => item.type == PlotType.Column || item.type == PlotType.StackingColumn

    for (const columnSeries of series.filter(isColumn)) {
        for (const value of columnSeries.values) {
            const key = value.x.toString()
            const group = groups.get(key) ?? { columns: [], hasStacking: false }

            if (columnSeries.type == PlotType.Column)
                group.columns.push(columnSeries)
            else
                group.hasStacking = true

            groups.set(key, group)
        }
    }

    return groups
}

export function getColumnGroup(groups: Map<string, ColumnGroup>, value: PlotPoint) {
    const group = groups.get(value.x.toString()) ?? { columns: [], hasStacking: false }

    return { columns: group.columns, slots: Math.max(group.columns.length + (group.hasStacking ? 1 : 0), 1) }
}