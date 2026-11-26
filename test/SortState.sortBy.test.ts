import SortState from '@/types/SortState'

describe('Sorting by column', () => {
    const sortBy = (...columns: string[]) => {
        const sort = new SortState()

        for (const column of columns)
            sort.sortBy(column)

        return [sort.column, sort.isDescending]
    }

    it('Should sort ascending by new column', () => {
        expect(sortBy('amount'))
            .toEqual(['amount', false])
    })

    it('Should flip direction for same column', () => {
        expect([sortBy('amount', 'amount'), sortBy('amount', 'amount', 'amount')])
            .toEqual([['amount', true], ['amount', false]])
    })

    it('Should reset direction when column changes', () => {
        expect(sortBy('amount', 'amount', 'code'))
            .toEqual(['code', false])
    })
})