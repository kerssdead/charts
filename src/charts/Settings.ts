import ChartSettings from '@/types/ChartSettings'
import ChartItem from '@/types/ChartItem'
import { ChartType } from '@/static/Enums'
import { deepClone } from '@/helpers/Collections'
import { getChartDefinition, hasLegend } from '@/charts/ChartDefinitions'
import { applyDefaultColors } from '@/charts/DefaultColors'

function normalizeChart({ type, data }: ChartItem, numberLocale: string | undefined, scope?: Element) {
    const definition = getChartDefinition(type)

    if (!definition || !data)
        return

    if (data.values)
        definition.prepareData(data, numberLocale)

    definition.normalizeData(data, numberLocale, scope)

    if (data.values)
        definition.mergeSameLabelValues?.(data)
}

export function normalize(source: ChartSettings, scope?: Element): ChartSettings {
    const clone = deepClone(source)

    const charts = clone.charts?.length
                   ? clone.charts.map(chart => ({ ...chart, type: chart.type ?? ChartType.Plot }))
                   : [{ type: clone.type ?? ChartType.Plot, data: clone.data }]

    const settings = { ...clone, charts }

    for (const chart of charts)
        normalizeChart(chart, settings.numberLocale, scope)

    applyDefaultColors(settings, scope)

    return {
        ...settings,
        enableTooltip: !settings.disableInteractions && settings.enableTooltip,
        enableLegend: charts.some(hasLegend) && settings.enableLegend
    }
}