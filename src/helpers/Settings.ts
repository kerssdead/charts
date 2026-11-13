import ChartSettings from '@/types/ChartSettings'
import { ChartType, PlotAxisType, PlotType } from '@/static/Enums'
import { normalizeColor, paletteColor, spreadColor } from '@/helpers/Color'
import { deepClone, groupBy } from '@/helpers/Collections'
import { parseNumber } from '@/helpers/Numbers'
import LegendValues from '@/legend/LegendValues'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import { TreeValue } from '@/types/data/TreeData'
import ChartItem from '@/types/ChartItem'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import { mergeSameLabelValues } from '@/helpers/ValueMerging'
import TreeBarRow from '@/types/TreeBarRow'
import TreeBarData, { colorTreeBarRows, keepTreeBarState } from '@/types/data/TreeBarData'
import PlotData from '@/types/data/PlotData'
import Formatter from '@/helpers/Formatter'

const BASE_COLOR_RANGE = 67

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
        enableLegend: charts.some(LegendValues.isSupported) && settings.enableLegend
    }
}

function prepareValues(chart: ChartItem, numberLocale: string | undefined) {
    if (!chart.data?.values)
        return

    const counts = new Map<string, number>()

    const prepare = <T extends Value>(
        value: T,
        hasDefaultLabel: boolean = chart.type !== ChartType.SegmentedBar
    ) => {
        if (value instanceof PlotSeries)
            value.type ??= PlotType.Line

        if (hasDefaultLabel)
            value.label ||= TextResources.noLabel

        const label = value.label ?? ''
        const count = counts.get(label) ?? 0

        counts.set(label, count + 1)

        value.labelIndex = count
        value.id ??= `${ label }-${ count }`

        return value
    }

    if (chart.type === ChartType.TreeBar) {
        const prepareRow = (value: TreeBarRow): TreeBarRow => {
            const row = prepare(value instanceof TreeBarRow ? value : new TreeBarRow(value))

            row.parts = (row.parts ?? []).map(part => {
                return prepare(part instanceof Value ? part : new Sector(part), false)
            })
            row.children = row.children?.map(prepareRow)

            return row
        }

        const data = chart.data as TreeBarData

        data.values = data.values.map(prepareRow)
        data.numberLocale = numberLocale

        return
    }

    chart.data.values = chart.data.values.map(value => {
        if (!(value instanceof Value))
            value = chart.type === ChartType.Plot
                    ? new PlotSeries(value)
                    : new Sector(value)

        return prepare(value)
    })

    if (chart.type === ChartType.SegmentedBar) {
        const data = chart.data as SegmentedBarData

        const toStop = (stop: SegmentedBarStop) => {
            return stop instanceof Value ? stop : new SegmentedBarStop(stop, numberLocale)
        }

        data.stops = (data.stops ?? []).map(stop => prepare(toStop(stop)))
    }
}

function getStops(chart: ChartItem) {
    return (chart.data as SegmentedBarData | undefined)?.stops
}

export function keepState(previous: ChartSettings, next: ChartSettings) {
    keepDisabled(previous, next)

    next.charts.forEach((chart, index) => {
        const old = previous.charts[index]

        if (chart.type === ChartType.TreeBar && old?.type === ChartType.TreeBar)
            keepTreeBarState(old.data as TreeBarData, chart.data as TreeBarData)
    })
}

export function keepDisabled(previous: ChartSettings, next: ChartSettings) {
    const getValues = (settings: ChartSettings) => settings.charts.flatMap(chart => chart.data?.values ?? [])
    const getKey = (settings: ChartSettings, value: Value) => {
        return LegendValues.getGroupKey(value, settings.charts.length > 1)
    }

    const disabled = new Map<string, boolean>()

    for (const value of getValues(previous))
        if (value.disabled)
            disabled.set(getKey(previous, value), true)

    for (const value of getValues(next))
        if (value.disabled === undefined && disabled.has(getKey(next, value)))
            value.disabled = true
}

function normalizeValues(values: Value[] | undefined, numberLocale: string | undefined, scope?: Element) {
    const toNumber = <T>(value: T) => {
        if (typeof value != 'string' && typeof value != 'number')
            return value

        const number = String(value) === '' ? NaN : parseNumber(value, numberLocale)

        return Number.isFinite(number) ? number : null
    }

    for (const value of values ?? []) {
        value.value = toNumber(value.value) as number

        if (value.color)
            value.color = normalizeColor(value.color, scope)

        if ((value as PlotSeries).values)
            (value as PlotSeries).values = (value as PlotSeries).values.filter(point => point.x != null)

        for (const point of (value as PlotSeries).values ?? []) {
            point.y = toNumber(point.y) ?? null

            if (String(point.x) === '')
                point.x = TextResources.noLabel
        }

        normalizeValues((value as TreeValue).sectors, numberLocale, scope)
        normalizeValues((value as TreeBarRow).parts, numberLocale, scope)
        normalizeValues((value as TreeBarRow).children, numberLocale, scope)
    }
}

function normalizeDates(chart: ChartItem) {
    const data = chart.data as PlotData | undefined

    if (chart.type !== ChartType.Plot || data?.xType !== PlotAxisType.Date)
        return

    for (const series of data.values ?? []) {
        for (const point of series.values ?? []) {
            const date = Formatter.toDate(point.x)

            if (!isNaN(date.getTime()))
                point.x = date.toISOString()
        }
    }
}

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
    const getGroupKey = (value: Value): string | Value => isShared ? LegendValues.getGroupKey(value, true) : value

    const groups = groupBy(chartValues, getGroupKey)

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