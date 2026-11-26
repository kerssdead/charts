import SortState from '@/types/SortState'

describe('Getting sort column', () => {
    it('Should have no column before sorting', () => {
        expect(new SortState().column)
            .toBeUndefined()
    })

    it('Should return the last sorted column', () => {
        const sort = new SortState()

        sort.sortBy('amount')
        sort.sortBy('code')

        expect(sort.column)
            .toBe('code')
    })
})