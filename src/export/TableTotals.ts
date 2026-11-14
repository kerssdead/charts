import TableData from '@/types/TableData'
import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'
import { sum } from '@/helpers/Collections'
import TextResources from '@/static/TextResources'
import { TableColumnKey } from '@/static/Enums'

function isTopLevel(value: TableValue) {
    return (value.level ?? 0) === 0
}

function getColumnTotal(table: TableData, column: string) {
    return sum(table.values.filter(isTopLevel), row => Number(row.values.get(column) ?? 0))
}

export function getTotals(table: TableData): number[] {
    return table.headers.map(header => getColumnTotal(table, header.value))
}

function withColumn(table: TableData, header: TableHeaderValue, getValue: (row: TableValue) => number): TableData {
    return {
        headers: [...table.headers, header],
        values: table.values.map(row => ({
            ...row,
            values: new Map([...row.values, [header.value, getValue(row)]])
        }))
    }
}

export function withRowTotals(table: TableData): TableData {
    if (table.headers.length < 2)
        return table

    return withColumn(
        table,
        { value: TableColumnKey.RowTotal, display: TextResources.total },
        row => sum(table.headers, header => row.values.get(header.value) ?? 0)
    )
}

export function withShares(table: TableData, column: string): TableData {
    const visibleTopLevel = table.values.filter(row => isTopLevel(row) && !row.disabled)
    const total = sum(visibleTopLevel, row => row.values.get(column) ?? 0)

    return withColumn(
        table,
        { value: TableColumnKey.Share, display: TextResources.share, percent: true },
        row => total && !row.disabled ? (row.values.get(column) ?? 0) / total * 100 : 0
    )
}