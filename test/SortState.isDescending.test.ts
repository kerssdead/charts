import SortState from '@/types/SortState'

describe('Getting sort direction', () => {
    it('Should be ascending before sorting', () => {
        expect(new SortState().isDescending)
            .toBe(false)
    })

    it('Should be descending after sorting the same column twice', () => {
        const sort = new SortState()

        sort.sortBy('amount')
        sort.sortBy('amount')

        expect(sort.isDescending)
            .toBe(true)
    })
})