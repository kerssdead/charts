import PlotSeries from '@/types/PlotSeries'
import PlotPoint from '@/types/PlotPoint'
import { PlotType } from '@/static/Enums'

export type ColumnGroup = {
    columns: PlotSeries[]
    hasStacking: boolean
}

export function getStackKey(value: PlotPoint) {
    return `${ value.x.toString() }${ Number(value.y) < 0 ? '-' : '+' }`
}

export function getStackTops(series: PlotSeries[]) {
    const stackTops = new Map<string, PlotSeries>()

    for (const stackedSeries of series.filter(item => item.type == PlotType.StackingColumn))
        for (const value of stackedSeries.values)
            if (Number(value.y) != 0)
                stackTops.set(getStackKey(value), stackedSeries)

    return stackTops
}

export function getColumnGroups(series: PlotSeries[]) {
    const groups = new Map<string, ColumnGroup>()

    for (const columnSeries of series.filter(item => item.type == PlotType.Column || item.type == PlotType.StackingColumn)) {
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