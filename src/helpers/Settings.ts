import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { deepClone } from '@/helpers/Collections'
import { hasLegend } from '@/helpers/ChartFeatures'
import { mergeSameLabelValues } from '@/helpers/ValueMerging'
import { getStops, normalizeDates, normalizeValues, prepareValues } from '@/helpers/SettingsInput'
import { applyDefaultColors } from '@/helpers/DefaultColors'

export function normalize(source: ChartSettings, scope?: Element): ChartSettings {
    const clone = deepClone(source)

    const charts = clone.charts?.length
                   ? clone.charts.map(chart => ({ ...chart, type: chart.type ?? ChartType.Plot }))
                   : [{ type: clone.type ?? ChartType.Plot, data: clone.data }]

    const settings = { ...clone, charts }

    for (const chart of charts) {
        prepareValues(chart, settings.numberLocale)
        normalizeValues(chart.data?.values, settings.numberLocale, scope)
        normalizeValues(getStops(chart), settings.numberLocale, scope)
        normalizeDates(chart)
        mergeSameLabelValues(chart)
    }

    applyDefaultColors(settings, scope)

    return {
        ...settings,
        enableTooltip: !settings.disableInteractions && settings.enableTooltip,
        enableLegend: charts.some(hasLegend) && settings.enableLegend
    }
}