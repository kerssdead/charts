import { PlotAxisType, PlotScaleType } from '@/static/Enums'
import { parseEnumInput } from '@/helpers/EnumInput'
import { normalizeColor } from '@/helpers/Color'
import { parseNumber } from '@/helpers/Numbers'
import Value from '@/types/base/Value'
import TextResources from '@/static/TextResources'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import TreeBarRow from '@/types/TreeBarRow'
import PlotData from '@/types/data/PlotData'
import TreeData from '@/types/data/TreeData'
import Formatter from '@/helpers/Formatter'

function toNumber<T>(value: T, numberLocale: string | undefined) {
    if (typeof value != 'string' && typeof value != 'number')
        return value

    const number = String(value) === '' ? NaN : parseNumber(value, numberLocale)

    return Number.isFinite(number) ? number : null
}

export function normalizeValues(values: Value[] | undefined, numberLocale: string | undefined, scope?: Element) {
    for (const value of values ?? []) {
        value.value = toNumber(value.value, numberLocale) as number

        if (value.color)
            value.color = normalizeColor(value.color, scope)
    }
}

export function normalizeSeries(data: PlotData, numberLocale: string | undefined, scope?: Element) {
    data.xType = parseEnumInput(PlotAxisType, data.xType) as PlotAxisType
    data.xScale = parseEnumInput(PlotScaleType, data.xScale)
    data.yScale = parseEnumInput(PlotScaleType, data.yScale)

    normalizeValues(data.values, numberLocale, scope)

    for (const series of data.values ?? []) {
        if (series.values)
            series.values = series.values.filter(point => point.x != null)

        for (const point of series.values ?? []) {
            point.y = toNumber(point.y, numberLocale) ?? null

            if (String(point.x) === '')
                point.x = TextResources.noLabel
        }
    }

    normalizeDates(data)
}

function normalizeDates(data: PlotData) {
    if (data.xType !== PlotAxisType.Date)
        return

    for (const series of data.values ?? []) {
        for (const point of series.values ?? []) {
            const date = Formatter.toDate(point.x)

            if (!isNaN(date.getTime()))
                point.x = date.toISOString()
        }
    }
}

export function normalizeTreeValues(data: TreeData, numberLocale: string | undefined, scope?: Element) {
    normalizeValues(data.values, numberLocale, scope)

    for (const value of data.values ?? [])
        normalizeValues(value.sectors, numberLocale, scope)
}

export function normalizeSegmentedBar(data: SegmentedBarData, numberLocale: string | undefined, scope?: Element) {
    normalizeValues(data.values, numberLocale, scope)
    normalizeValues(data.stops, numberLocale, scope)
}

export function normalizeTreeBarRows(
    rows: TreeBarRow[] | undefined,
    numberLocale: string | undefined,
    scope?: Element
) {
    normalizeValues(rows, numberLocale, scope)

    for (const row of rows ?? []) {
        normalizeValues(row.parts, numberLocale, scope)
        normalizeTreeBarRows(row.children, numberLocale, scope)
    }
}