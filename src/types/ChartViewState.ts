import Value from '@/types/base/Value'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'
import { mergeKeyFlags, toggleKey } from '@/helpers/KeySets'

export type IsDisabled = (value: Value) => boolean

export default class ChartViewState {
    readonly isDisabled: IsDisabled

    private currentSortColumn: string | undefined

    private isCurrentSortDescending: boolean = false

    private pinned = new Set<string>()

    private expanded = new Set<string>()

    constructor(isDisabled: IsDisabled) {
        this.isDisabled = isDisabled
    }

    get sortColumn() {
        return this.currentSortColumn
    }

    get isSortDescending() {
        return this.isCurrentSortDescending
    }

    isPinned(sector: Sector) {
        return this.pinned.has(sector.id)
    }

    togglePinned(sector: Sector) {
        toggleKey(this.pinned, sector.id)
    }

    clearPinned() {
        this.pinned.clear()
    }

    isExpanded(row: TreeBarRow) {
        return this.expanded.has(row.id)
    }

    toggleExpanded(row: TreeBarRow) {
        toggleKey(this.expanded, row.id)
    }

    sortBy(column: string) {
        this.isCurrentSortDescending = this.currentSortColumn === column && !this.isCurrentSortDescending
        this.currentSortColumn = column
    }

    applyPinned(sectors: Sector[]) {
        this.pinned = mergeKeyFlags(sectors.map(sector => [sector.id, sector.pinned]), this.pinned)
    }

    applyExpanded(rows: TreeBarRow[]) {
        this.expanded = mergeKeyFlags(rows.map(row => [row.id, row.expanded]), this.expanded)
    }

    applySort(column: string | undefined, isDescending: boolean | undefined) {
        if (column === undefined)
            return

        this.currentSortColumn = column
        this.isCurrentSortDescending = !!isDescending
    }
}