import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { normalizeColor, paletteColor, spreadColor } from '@/helpers/Color'
import { groupBy } from '@/helpers/Collections'
import { getGroupKey } from '@/helpers/ValueKeys'
import Value from '@/types/base/Value'
import ChartItem from '@/types/ChartItem'
import TreeBarData, { colorTreeBarRows } from '@/types/data/TreeBarData'
import { getStops } from '@/helpers/SettingsInput'

const BASE_COLOR_RANGE = 67

function shareGroupColors(groups: Iterable<Value[]>) {
    for (const values of groups) {
        const color = values.find(value => value.color)?.color

        if (color)
            for (const value of values)
                value.color ||= color
    }
}

export function applyDefaultColors(settings: ChartSettings, scope?: Element) {
    const isShared = settings.charts.length > 1
    const isTreeBar = (chart: ChartItem) => chart.type === ChartType.TreeBar
    const base = settings.baseColor ? normalizeColor(settings.baseColor, scope) : undefined

    for (const chart of settings.charts.filter(isTreeBar))
        colorTreeBarRows((chart.data as TreeBarData | undefined)?.values, base ?? paletteColor(0))

    const chartValues = settings.charts
                                .filter(chart => !isTreeBar(chart))
                                .flatMap(chart => chart.data?.values ?? [])
    const getColorKey = (value: Value): string | Value => isShared ? getGroupKey(value, true) : value

    const groups = groupBy(chartValues, getColorKey)

    shareGroupColors(groups.values())

    const stops = settings.charts.flatMap(chart => getStops(chart) ?? []).map(stop => [stop])

    const uncolored = [...groups.values(), ...stops].filter(values => !values[0].color)

    if (uncolored.length === 0)
        return

    uncolored.forEach((values, index) => {
        const color = base ? spreadColor(base, index, uncolored.length, BASE_COLOR_RANGE) : paletteColor(index)

        for (const value of values)
            value.color = color
    })
}