import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'
import Value from '@/types/base/Value'
import { sum } from '@/helpers/Collections'
import TextResources from '@/static/TextResources'
import { SortDirection, TableColumnKey } from '@/static/Enums'

export default interface TableData {
    headers: TableHeaderValue[]

    values: TableValue[]
}

export function getValueRows<T extends Value>(
    values: T[],
    getValue: (value: T) => number = value => value.value
): TableData {
    const key = TextResources.value

    return {
        headers: [{ value: key, display: key }],
        values: values.map(value => ({
            name: value.label,
            color: value.color,
            disabled: value.disabled,
            values: new Map([[key, getValue(value)]])
        }))
    }
}

function isTopLevel(value: TableValue) {
    return (value.level ?? 0) === 0
}

function getColumnTotal(table: TableData, column: string) {
    return sum(table.values.filter(isTopLevel), row => Number(row.values.get(column) ?? 0))
}

export function getTotals(table: TableData): number[] {
    return table.headers.map(header => getColumnTotal(table, header.value))
}

export function sortTableValues(
    values: TableValue[],
    column: string | undefined,
    direction: SortDirection
): TableValue[] {
    if (direction === SortDirection.None)
        return values

    const sign = direction === SortDirection.Ascending ? 1 : -1

    const compareNames = (a: TableValue, b: TableValue) => {
        return sign * a.name.localeCompare(b.name, undefined, { numeric: true })
    }

    const compareCells = (key: string) => (a: TableValue, b: TableValue) => {
        const first = a.values.get(key)
        const second = b.values.get(key)

        if (first === undefined || second === undefined)
            return Number(first === undefined) - Number(second === undefined)

        return sign * (first - second)
    }

    const compare = column === undefined ? compareNames : compareCells(column)

    const childrenByParent = new Map<TableValue | undefined, TableValue[]>()
    const path: TableValue[] = []

    for (const value of values) {
        const level = value.level ?? 0
        const parent = level > 0 ? path[level - 1] : undefined

        path[level] = value

        const siblings = childrenByParent.get(parent)

        if (siblings)
            siblings.push(value)
        else
            childrenByParent.set(parent, [value])
    }

    const sorted: TableValue[] = []

    const appendChildren = (parent: TableValue | undefined) => {
        for (const child of (childrenByParent.get(parent) ?? []).sort(compare)) {
            sorted.push(child)
            appendChildren(child)
        }
    }

    appendChildren(undefined)

    return sorted
}

export function getMatchingValues(values: TableValue[], query: string): Set<TableValue> {
    const search = query.trim().toLocaleLowerCase()

    if (!search)
        return new Set(values)

    const matching = new Set<TableValue>()
    const path: TableValue[] = []

    for (const value of values) {
        const level = value.level ?? 0

        path[level] = value

        if (value.name.toLocaleLowerCase().includes(search))
            for (let index = 0; index <= level; index++)
                matching.add(path[index])
    }

    return matching
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

export function toTabSeparatedText(table: TableData): string {
    const clean = (value: string) => value.replace(/[\t\r\n]+/g, ' ')
    const getCells = (row: TableValue) => table.headers.map(header => `${ row.values.get(header.value) ?? '' }`)

    const lines = [
        ['', ...table.headers.map(header => clean(header.display))],
        ...table.values.map(row => [clean(row.name), ...getCells(row)]),
        [TextResources.total, ...getTotals(table).map(total => `${ total }`)]
    ]

    return lines.map(line => line.join('\t')).join('\n')
}