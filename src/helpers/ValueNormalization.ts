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
import HeatMapData, { isPointData } from '@/types/data/HeatMapData'
import Formatter from '@/helpers/Formatter'

function toNumber<T>(value: T, numberLocale: string | undefined) {
    if (typeof value == 'number')
        return Number.isFinite(value) ? value : null

    if (typeof value != 'string')
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

export function normalizeHeatMap(data: HeatMapData, numberLocale: string | undefined, scope?: Element) {
    normalizeValues(data.values, numberLocale, scope)

    if (data.color)
        data.color = normalizeColor(data.color, scope)

    if (data.colors)
        data.colors = data.colors.map(color => normalizeColor(color, scope))

    data.radius = toNumber(data.radius, numberLocale) as number
    data.width = toNumber(data.width, numberLocale) as number
    data.height = toNumber(data.height, numberLocale) as number
    data.opacity = toNumber(data.opacity, numberLocale) as number

    if (isPointData(data))
        return normalizeHeatMapPoints(data, numberLocale)

    const cells = new Map(data.values.filter(cell => Number.isFinite(cell.value))
                                     .map(cell => [JSON.stringify([cell.x, cell.y]), cell]))

    data.xLabels = [...new Set(data.xLabels?.map(String) ?? [...cells.values()].map(cell => String(cell.x)))]
    data.yLabels = [...new Set(data.yLabels?.map(String) ?? [...cells.values()].map(cell => String(cell.y)))]

    const xs = new Set(data.xLabels)
    const ys = new Set(data.yLabels)

    data.values = [...cells.values()].filter(cell => xs.has(String(cell.x)) && ys.has(String(cell.y)))
}

function normalizeHeatMapPoints(data: HeatMapData, numberLocale: string | undefined) {
    for (const point of data.values) {
        point.x = toNumber(point.x, numberLocale) as number
        point.y = toNumber(point.y, numberLocale) as number
    }

    data.values = data.values.filter(point => [point.value, point.x, point.y].every(Number.isFinite))
}