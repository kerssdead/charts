import ChartSettings from '@/types/ChartSettings'
import { getGroupKey } from '@/helpers/ValueKeys'
import Value from '@/types/base/Value'
import { getChartDefinition } from '@/charts/ChartDefinitions'

export function keepState(previous: ChartSettings, next: ChartSettings) {
    keepDisabled(previous, next)

    next.charts.forEach((chart, index) => {
        const old = previous.charts[index]

        if (old?.type === chart.type)
            getChartDefinition(chart.type)?.keepState?.(old.data, chart.data)
    })
}

export function keepDisabled(previous: ChartSettings, next: ChartSettings) {
    const getValues = (settings: ChartSettings) => settings.charts.flatMap(chart => chart.data?.values ?? [])
    const getKey = (settings: ChartSettings, value: Value) => {
        return getGroupKey(value, settings.charts.length > 1)
    }

    const disabled = new Map<string, boolean>()

    for (const value of getValues(previous))
        if (value.disabled)
            disabled.set(getKey(previous, value), true)

    for (const value of getValues(next))
        if (value.disabled === undefined && disabled.has(getKey(next, value)))
            value.disabled = true
}