import TableData, { sortTableValues } from '@/types/TableData'
import TableValue from '@/types/TableValue'
import { Attribute, Events, SortDirection, TableClasses } from '@/static/Enums'

export function getNextSortDirection(direction: SortDirection) {
    switch (direction) {
        case SortDirection.None:
            return SortDirection.Ascending

        case SortDirection.Ascending:
            return SortDirection.Descending

        default:
            return SortDirection.None
    }
}

export default class TableSorting {
    static attach(header: HTMLElement, body: HTMLElement, data: TableData, rows: HTMLElement[]) {
        const rowByValue = new Map<TableValue, HTMLElement>(
            data.values.map((value, index) => [value, rows[index]])
        )
        const columns = [undefined, ...data.headers.map(header => header.value)]
        const headerCells = [...header.children] as HTMLElement[]

        let sortedCell: HTMLElement | undefined
        let direction = SortDirection.None

        for (const [index, cell] of headerCells.entries()) {
            cell.classList.add(TableClasses.Sortable)
            cell.setAttribute(Attribute.AriaSort, SortDirection.None)

            cell.addEventListener(Events.Click, () => {
                direction = cell === sortedCell ? getNextSortDirection(direction) : SortDirection.Ascending
                sortedCell = cell

                for (const other of headerCells)
                    other.setAttribute(Attribute.AriaSort, other === cell ? direction : SortDirection.None)

                for (const value of sortTableValues(data.values, columns[index], direction)) {
                    const row = rowByValue.get(value)

                    if (row)
                        body.append(row)
                }
            })
        }
    }
}