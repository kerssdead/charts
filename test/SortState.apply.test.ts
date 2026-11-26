import SortState from '@/types/SortState'

describe('Applying sort', () => {
    it('Should take explicit column and direction', () => {
        const sort = new SortState()

        sort.apply('amount', true)

        expect([sort.column, sort.isDescending])
            .toEqual(['amount', true])
    })

    it('Should default direction to ascending', () => {
        const sort = new SortState()

        sort.sortBy('code')
        sort.sortBy('code')
        sort.apply('amount', undefined)

        expect([sort.column, sort.isDescending])
            .toEqual(['amount', false])
    })

    it('Should keep current sort without explicit column', () => {
        const sort = new SortState()

        sort.sortBy('amount')
        sort.sortBy('amount')
        sort.apply(undefined, false)

        expect([sort.column, sort.isDescending])
            .toEqual(['amount', true])
    })
})