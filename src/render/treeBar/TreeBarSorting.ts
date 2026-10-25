import TreeBarRow from '@/types/TreeBarRow'
import { getCellNumber, TreeBarEntry } from '@/types/data/TreeBarData'
import { SORT_ASCENDING, SORT_DESCENDING } from '@/render/treeBar/TreeBarConstants'

function isMissing(value: string | number | undefined) {
    return value == undefined || value === ''
}

export function sortRows(rows: TreeBarRow[], sortColumn: string | undefined, isDescending: boolean | undefined) {
    if (sortColumn == undefined)
        return rows

    const compare = (a: TreeBarRow, b: TreeBarRow) => {
        const first = a.cells?.[sortColumn]
        const second = b.cells?.[sortColumn]

        if (isMissing(first) || isMissing(second))
            return +isMissing(first) - +isMissing(second)

        const firstNumber = getCellNumber(first)
        const secondNumber = getCellNumber(second)

        const result = Number.isFinite(firstNumber) && Number.isFinite(secondNumber)
                       ? firstNumber - secondNumber
                       : String(first).localeCompare(String(second), undefined, { numeric: true })

        return isDescending ? -result : result
    }

    return [...rows].sort(compare)
}

export function getVisibleEntries(
    rows: TreeBarRow[],
    sortColumn: string | undefined,
    isDescending: boolean | undefined,
    level: number = 0
): TreeBarEntry[] {
    return sortRows(rows, sortColumn, isDescending).flatMap(node => [
        { node, level },
        ...(node.expanded && node.children
            ? getVisibleEntries(node.children, sortColumn, isDescending, level + 1)
            : [])
    ])
}

export function getSortIndicator(columnKey: string, sortColumn: string | undefined, isDescending: boolean | undefined) {
    if (sortColumn != columnKey)
        return ''

    return isDescending ? SORT_DESCENDING : SORT_ASCENDING
}