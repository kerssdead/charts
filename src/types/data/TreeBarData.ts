import TreeBarRow from '@/types/TreeBarRow'
import Data from '@/types/interfaces/Data'
import { sum } from '@/helpers/Collections'
import { parseNumber } from '@/helpers/Numbers'
import ChartViewState from '@/types/ChartViewState'

export type TreeBarColumn = {
    key: string

    title: string
}

export default interface TreeBarData extends Data {
    values: TreeBarRow[]

    columns?: TreeBarColumn[]

    sortColumn?: string

    sortDescending?: boolean

    numberLocale?: string
}

export type TreeBarEntry = {
    node: TreeBarRow

    level: number
}

export function flattenTreeBarRows(
    rows: TreeBarRow[] | undefined,
    isOpen: (node: TreeBarRow) => boolean = () => true,
    level: number = 0
): TreeBarEntry[] {
    return (rows ?? []).flatMap(node => [
        { node, level },
        ...(isOpen(node) ? flattenTreeBarRows(node.children, isOpen, level + 1) : [])
    ])
}

export function getAllTreeBarRows(rows: TreeBarRow[] | undefined) {
    return flattenTreeBarRows(rows).map(({ node }) => node)
}

export function applyTreeBarViewState(data: TreeBarData, state: ChartViewState) {
    state.applyExpanded(getAllTreeBarRows(data.values))
    state.applySort(data.sortColumn, data.sortDescending)
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

export function getCellNumber(value: string | number | undefined, numberLocale?: string) {
    return typeof value == 'number' ? value : parseNumber(value, numberLocale)
}