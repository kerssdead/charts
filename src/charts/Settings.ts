import ChartSettings from '@/types/ChartSettings'
import ChartOptions from '@/types/ChartOptions'
import ChartItem from '@/types/ChartItem'
import { ChartType, LegendPlace } from '@/static/Enums'
import { deepClone } from '@/helpers/Collections'
import { getChartDefinition, hasLegend } from '@/charts/ChartDefinitions'
import { prefersReducedMotion } from '@/helpers/Motion'
import { parseEnumInput } from '@/helpers/EnumInput'
import { applyDefaultColors } from '@/charts/DefaultColors'

function normalizeChart({ type, data }: ChartItem, numberLocale: string | undefined, scope?: Element) {
    const definition = getChartDefinition(type)

    if (!data)
        return

    if (data.values)
        definition.prepareData(data, numberLocale)

    definition.normalizeData(data, numberLocale, scope)

    if (data.values)
        definition.mergeSameLabelValues?.(data)
}

export function normalize(source: ChartOptions, scope?: Element): ChartSettings {
    const clone = deepClone(source)

    const toChartType = (type: ChartOptions['type']) => parseEnumInput(ChartType, type) ?? ChartType.Plot

    const charts = (clone.charts?.length
                    ? clone.charts.map(chart => ({ ...chart, type: toChartType(chart.type) }))
                    : [{ type: toChartType(clone.type), data: clone.data }]) as ChartItem[]

    const settings = {
        ...clone,
        charts,
        legendPlace: parseEnumInput(LegendPlace, clone.legendPlace)
    } as ChartSettings

    for (const chart of charts)
        normalizeChart(chart, settings.numberLocale ?? settings.locale, scope)

    applyDefaultColors(settings, scope)

    return {
        ...settings,
        staticMode: settings.staticMode || prefersReducedMotion(),
        enableTooltip: !settings.disableInteractions && settings.enableTooltip,
        enableLegend: charts.some(hasLegend) && settings.enableLegend
    }
}