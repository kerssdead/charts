import ChartSettings from '@/types/ChartSettings'
import { ChartType, PlotType } from '@/static/Enums'
import { normalizeColor, spreadColor } from '@/helpers/Color'
import { deepClone, groupBy } from '@/helpers/Collections'
import { parseNumber } from '@/helpers/Numbers'
import Legend from '@/Legend'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import { TreeValue } from '@/types/data/TreeData'
import ChartItem from '@/types/ChartItem'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'

const BASE_COLOR_RANGE = 67

export function normalize(source: ChartSettings, fallbackColor: string): ChartSettings {
    const clone = deepClone(source)

    const charts = clone.charts?.length
                   ? clone.charts.map(chart => ({ ...chart, type: chart.type ?? ChartType.Plot }))
                   : [{ type: clone.type ?? ChartType.Plot, data: clone.data }]

    const settings = { ...clone, charts }

    for (const chart of charts) {
        prepareValues(chart)
        normalizeValues(chart.data?.values)
    }

    applyBaseColor(settings, fallbackColor)

    return {
        ...settings,
        enableTooltip: !settings.disableInteractions && settings.enableTooltip,
        enableLegend: charts.some(Legend.isSupported) && settings.enableLegend
    }
}

function prepareValues(chart: ChartItem) {
    if (!chart.data?.values)
        return

    const counts = new Map<string, number>()

    chart.data.values = chart.data.values.map(value => {
        if (!(value instanceof Value))
            value = chart.type == ChartType.Plot
                    ? new PlotSeries(value)
                    : new Sector(value)

        if (value instanceof PlotSeries)
            value.type ??= PlotType.Line

        value.label ??= TextResources.noLabel

        const count = counts.get(value.label) ?? 0

        counts.set(value.label, count + 1)

        value.labelIndex = count
        value.id ??= `${ value.label }-${ count }`

        return value
    })
}

export function keepDisabled(previous: ChartSettings, next: ChartSettings) {
    const getValues = (settings: ChartSettings) => settings.charts.flatMap(chart => chart.data?.values ?? [])
    const getKey = (settings: ChartSettings, value: Value) => Legend.getGroupKey(value, settings.charts.length > 1)

    const disabled = new Map<string, boolean>()

    for (const value of getValues(previous))
        if (value.disabled)
            disabled.set(getKey(previous, value), true)

    for (const value of getValues(next))
        if (value.disabled == undefined && disabled.has(getKey(next, value)))
            value.disabled = true
}

function normalizeValues(values: Value[] | undefined) {
    const toNumber = <T>(value: T) => {
        if (typeof value != 'string' && typeof value != 'number')
            return value

        const number = parseNumber(value)

        return Number.isFinite(number) ? number : 0
    }

    for (const value of values ?? []) {
        value.value = toNumber(value.value)

        if (value.color)
            value.color = normalizeColor(value.color)

        if ((value as PlotSeries).values)
            (value as PlotSeries).values = (value as PlotSeries).values.filter(point => point.x != null)

        for (const point of (value as PlotSeries).values ?? [])
            point.y = toNumber(point.y ?? 0)

        normalizeValues((value as TreeValue).sectors)
    }
}

export function applyBaseColor(settings: ChartSettings, fallbackColor: string) {
    const isShared = settings.charts.length > 1
    const groups = groupBy(settings.charts.flatMap(chart => chart.data?.values ?? []),
        (value): string | Value => isShared ? Legend.getGroupKey(value, true) : value)

    for (const values of groups.values()) {
        const color = values.find(value => value.color)?.color

        if (color)
            for (const value of values)
                value.color ||= color
    }

    const uncolored = Array.from(groups.values()).filter(values => !values[0].color)

    if (uncolored.length == 0)
        return

    const base = settings.baseColor ? normalizeColor(settings.baseColor) : fallbackColor

    uncolored.forEach((values, index) => {
        const color = spreadColor(base, index, uncolored.length, BASE_COLOR_RANGE)

        for (const value of values)
            value.color = color
    })
}