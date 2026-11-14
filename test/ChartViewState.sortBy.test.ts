import ChartViewState from '@/types/ChartViewState'
import { isDisabledByFlag } from './ViewStateTestData'

describe('Sorting by column', () => {
    const sort = (...columns: string[]) => {
        const state = new ChartViewState(isDisabledByFlag)

        for (const column of columns)
            state.sortBy(column)

        return [state.sortColumn, state.isSortDescending]
    }

    it('Should sort ascending by new column', () => {
        expect(sort('amount'))
            .toEqual(['amount', false])
    })

    it('Should flip direction for same column', () => {
        expect([sort('amount', 'amount'), sort('amount', 'amount', 'amount')])
            .toEqual([['amount', true], ['amount', false]])
    })

    it('Should reset direction when column changes', () => {
        expect(sort('amount', 'amount', 'code'))
            .toEqual(['code', false])
    })
})