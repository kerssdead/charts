import ChartItem from '@/types/ChartItem'
import { ChartType, PlotAxisType, PlotType } from '@/static/Enums'
import { normalizeColor } from '@/helpers/Color'
import { parseNumber } from '@/helpers/Numbers'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import { TreeValue } from '@/types/data/TreeData'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import TreeBarRow from '@/types/TreeBarRow'
import TreeBarData from '@/types/data/TreeBarData'
import PlotData from '@/types/data/PlotData'
import Formatter from '@/helpers/Formatter'

export function prepareValues(chart: ChartItem, numberLocale: string | undefined) {
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

export function getStops(chart: ChartItem) {
    return (chart.data as SegmentedBarData | undefined)?.stops
}

export function normalizeValues(values: Value[] | undefined, numberLocale: string | undefined, scope?: Element) {
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

export function normalizeDates(chart: ChartItem) {
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