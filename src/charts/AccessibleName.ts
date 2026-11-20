import ChartSettings from '@/types/ChartSettings'
import ChartItem from '@/types/ChartItem'
import TextResources from '@/static/TextResources'
import Formatter from '@/helpers/Formatter'

const MAX_ENTRIES = 8

function describeValue(value: { label?: string, value?: number }, settings: ChartSettings) {
    const hasValue = typeof value.value === 'number' && Number.isFinite(value.value)

    return [value.label, hasValue ? Formatter.value(value.value, settings.valuePostfix, settings.decimals) : '']
        .filter(Boolean)
        .join(' ')
}

function describeChart(chart: ChartItem, settings: ChartSettings) {
    const values = chart.data?.values ?? []
    const entries = values.slice(0, MAX_ENTRIES).map(value => describeValue(value, settings))

    if (values.length > MAX_ENTRIES)
        entries.push('…')

    return [chart.title, entries.filter(Boolean).join(', ')]
        .filter(Boolean)
        .join(': ')
}

export function getAccessibleName(settings: ChartSettings) {
    if (settings.ariaLabel)
        return settings.ariaLabel

    return [settings.title, ...settings.charts.map(chart => describeChart(chart, settings))]
        .filter(Boolean)
        .join('. ') || TextResources.defaultImageName
}