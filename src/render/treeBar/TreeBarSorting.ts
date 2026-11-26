import TreeBarRow from '@/types/TreeBarRow'
import { getCellNumber, TreeBarEntry } from '@/types/data/TreeBarData'
import ChartViewState from '@/types/ChartViewState'
import TextResources from '@/static/TextResources'

function isMissing(value: string | number | undefined) {
    return String(value ?? '') === ''
}

export function sortRows(
    rows: TreeBarRow[],
    sortColumn: string | undefined,
    isDescending: boolean | undefined,
    numberLocale?: string
) {
    if (sortColumn === undefined)
        return rows

    const compare = (a: TreeBarRow, b: TreeBarRow) => {
        const first = a.cells?.[sortColumn]
        const second = b.cells?.[sortColumn]

        if (isMissing(first) || isMissing(second))
            return +isMissing(first) - +isMissing(second)

        const firstNumber = getCellNumber(first, numberLocale)
        const secondNumber = getCellNumber(second, numberLocale)

        const result = Number.isFinite(firstNumber) && Number.isFinite(secondNumber)
                       ? firstNumber - secondNumber
                       : String(first).localeCompare(String(second), undefined, { numeric: true })

        return isDescending ? -result : result
    }

    return [...rows].sort(compare)
}

export type TreeBarView = Pick<ChartViewState, 'sort' | 'expanded'>

export function getVisibleEntries(
    rows: TreeBarRow[],
    view: TreeBarView,
    numberLocale?: string,
    level = 0
): TreeBarEntry[] {
    return sortRows(rows, view.sort.column, view.sort.isDescending, numberLocale).flatMap(node => [
        { node, level },
        ...(view.expanded.has(node) && node.children
            ? getVisibleEntries(node.children, view, numberLocale, level + 1)
            : [])
    ])
}

export function getSortIndicator(
    columnKey: string,
    sortColumn: string | undefined,
    isDescending: boolean | undefined
) {
    if (sortColumn !== columnKey)
        return ''

    return isDescending ? TextResources.sortDescending : TextResources.sortAscending
}