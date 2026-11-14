import TableData from '@/types/TableData'
import TableHeaderValue from '@/types/TableHeaderValue'
import Value from '@/types/base/Value'
import PlotData from '@/types/data/PlotData'
import { getY } from '@/types/PlotPoint'
import TreeBarData, { flattenTreeBarRows, getCellNumber, getTreeBarTotal } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Formatter from '@/helpers/Formatter'
import TextResources from '@/static/TextResources'
import { PlotAxisType } from '@/static/Enums'
import { IsDisabled } from '@/types/ChartViewState'

export function getValueRows<T extends Value>(
    values: T[],
    isDisabled: IsDisabled,
    getValue: (value: T) => number = value => value.value
): TableData {
    const key = TextResources.value

    return {
        headers: [{ value: key, display: key }],
        values: values.map(value => ({
            name: value.label ?? '',
            color: value.color,
            disabled: isDisabled(value),
            values: new Map([[key, getValue(value)]])
        }))
    }
}

export function getPlotRows(data: PlotData, isDisabled: IsDisabled): TableData {
    const headers = new Map<string, TableHeaderValue>()

    const values = data.values.map(series => {
        const seriesValues = new Map<string, number>()

        for (const value of series.values) {
            const key = value.x.toString()

            const y = getY(value)

            if (y != null)
                seriesValues.set(key, y)

            if (!headers.has(key))
                headers.set(key, { value: key, display: Formatter.axis(value.x, data.xType) })
        }

        return { name: series.label, color: series.color, disabled: isDisabled(series), values: seriesValues }
    })

    const uniqueHeaders = [...headers.values()]

    const order = (x: string) => data.xType === PlotAxisType.Date ? Formatter.toDate(x).getTime() : Number(x)

    if (data.xType !== PlotAxisType.Text && uniqueHeaders.every(header => !isNaN(order(header.value))))
        uniqueHeaders.sort((a, b) => order(a.value) - order(b.value))

    return { headers: uniqueHeaders, values }
}

export function getTreeBarRows(data: TreeBarData, isDisabled: IsDisabled): TableData {
    const columns = data.columns ?? []
    const entries = flattenTreeBarRows(data.values)
    const nodes = entries.map(({ node }) => node)
    const getCellValue = (row: TreeBarRow, key: string) => getCellNumber(row.cells?.[key], data.numberLocale) || 0

    const table: TableData = columns.length > 0
                  ? {
                      headers: columns.map(column => ({ value: column.key, display: column.title })),
                      values: nodes.map(row => ({
                          name: row.label,
                          color: row.color,
                          disabled: isDisabled(row),
                          values: new Map(columns.map(column => [column.key, getCellValue(row, column.key)]))
                      }))
                  }
                  : getValueRows(nodes, isDisabled, getTreeBarTotal)

    for (const [index, row] of table.values.entries()) {
        row.name = row.name.replace(/\n/g, ' ')
        row.level = entries[index].level
    }

    return table
}