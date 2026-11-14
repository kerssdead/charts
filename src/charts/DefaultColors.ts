import ChartSettings from '@/types/ChartSettings'
import { normalizeColor, paletteColor, spreadColor } from '@/helpers/Color'
import { groupBy } from '@/helpers/Collections'
import { getGroupKey } from '@/helpers/ValueKeys'
import Value from '@/types/base/Value'
import { getChartDefinition } from '@/charts/ChartDefinitions'

const BASE_COLOR_RANGE = 67

function shareGroupColors(groups: Iterable<Value[]>) {
    for (const values of groups) {
        const color = values.find(value => value.color)?.color

        if (color)
            for (const value of values)
                value.color ||= color
    }
}

function getChartsWithDefinitions(settings: ChartSettings) {
    return settings.charts.flatMap(({ type, data }) => {
        const definition = getChartDefinition(type)

        return definition && data ? [{ definition, data }] : []
    })
}

export function applyDefaultColors(settings: ChartSettings, scope?: Element) {
    const isShared = settings.charts.length > 1
    const base = settings.baseColor ? normalizeColor(settings.baseColor, scope) : undefined
    const charts = getChartsWithDefinitions(settings)

    for (const { definition, data } of charts)
        definition.applyOwnColors?.(data, base ?? paletteColor(0))

    const chartValues = charts.flatMap(({ definition, data }) => definition.getPaletteValues(data))
    const getColorKey = (value: Value): string | Value => isShared ? getGroupKey(value, true) : value

    const groups = groupBy(chartValues, getColorKey)

    shareGroupColors(groups.values())

    const ungrouped = charts.flatMap(({ definition, data }) => definition.getUngroupedPaletteValues?.(data) ?? [])
                            .map(value => [value])

    const uncolored = [...groups.values(), ...ungrouped].filter(values => !values[0].color)

    if (uncolored.length === 0)
        return

    uncolored.forEach((values, index) => {
        const color = base ? spreadColor(base, index, uncolored.length, BASE_COLOR_RANGE) : paletteColor(index)

        for (const value of values)
            value.color = color
    })
}