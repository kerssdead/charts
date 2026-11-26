export default class SortState {
    private currentColumn?: string

    private isCurrentDescending = false

    get column() {
        return this.currentColumn
    }

    get isDescending() {
        return this.isCurrentDescending
    }

    sortBy(column: string) {
        this.isCurrentDescending = this.currentColumn === column && !this.isCurrentDescending
        this.currentColumn = column
    }

    apply(column: string | undefined, isDescending: boolean | undefined) {
        if (column === undefined)
            return

        this.currentColumn = column
        this.isCurrentDescending = !!isDescending
    }
}