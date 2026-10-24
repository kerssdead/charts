import TreeBarRow from '@/types/TreeBarRow'
import Data from '@/types/interfaces/Data'
import TableData, { getValueRows } from '@/types/TableData'
import { sum } from '@/helpers/Collections'
import { parseNumber } from '@/helpers/Numbers'

export type TreeBarColumn = {
    key: string

    title: string
}

export default interface TreeBarData extends Data {
    values: TreeBarRow[]

    columns?: TreeBarColumn[]

    sortColumn?: string

    sortDescending?: boolean
}

export type TreeBarEntry = {
    node: TreeBarRow

    level: number
}

export function flattenTreeBarRows(rows: TreeBarRow[] | undefined,
                                   isOpen: (node: TreeBarRow) => boolean = () => true,
                                   level: number = 0): TreeBarEntry[] {
    return (rows ?? []).flatMap(node => [
        { node, level },
        ...(isOpen(node) ? flattenTreeBarRows(node.children, isOpen, level + 1) : [])
    ])
}

export function keepTreeBarState(previous: TreeBarData, next: TreeBarData) {
    const expanded = new Map(flattenTreeBarRows(previous.values).map(({ node }) => [node.id, node.expanded]))

    for (const { node } of flattenTreeBarRows(next.values))
        node.expanded ??= expanded.get(node.id)

    if (next.sortColumn == undefined) {
        next.sortColumn = previous.sortColumn
        next.sortDescending = previous.sortDescending
    }
}

export function colorTreeBarRows(rows: TreeBarRow[] | undefined, color: string) {
    for (const row of rows ?? []) {
        row.color ||= color

        for (const part of row.parts ?? [])
            part.color ||= row.color

        colorTreeBarRows(row.children, row.color)
    }
}

export function getTreeBarTotal(row: TreeBarRow) {
    return sum(row.parts, part => Math.max(part.value || 0, 0))
}

export function getCellNumber(value: string | number | undefined) {
    return typeof value == 'number' ? value : parseNumber(value)
}

export function getTreeBarRows(data: TreeBarData): TableData {
    const columns = data.columns ?? []

    const table = columns.length > 0
                  ? {
                      headers: columns.map(column => ({ value: column.key, display: column.title })),
                      values: data.values.map(row => ({
                          name: row.label,
                          values: new Map(columns.map(column => [column.key, getCellNumber(row.cells?.[column.key]) || 0]))
                      }))
                  }
                  : getValueRows(data.values, getTreeBarTotal)

    for (const row of table.values)
        row.name = row.name.replace(/\n/g, ' ')

    return table
}
