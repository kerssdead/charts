import { getNextSortDirection } from '@/export/TableSorting'
import { SortDirection } from '@/static/Enums'

describe('Getting next table sort direction', () => {
    it('Should cycle from none to ascending to descending and back to none', () => {
        expect([
            getNextSortDirection(SortDirection.None),
            getNextSortDirection(SortDirection.Ascending),
            getNextSortDirection(SortDirection.Descending)
        ])
            .toEqual([SortDirection.Ascending, SortDirection.Descending, SortDirection.None])
    })
})