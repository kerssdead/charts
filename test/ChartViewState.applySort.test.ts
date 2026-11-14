import ChartViewState from '@/types/ChartViewState'
import { isDisabledByFlag } from './ViewStateTestData'

describe('Applying sort', () => {
    it('Should take explicit column and direction', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applySort('amount', true)

        expect([state.sortColumn, state.isSortDescending])
            .toEqual(['amount', true])
    })

    it('Should default direction to ascending', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.sortBy('code')
        state.sortBy('code')
        state.applySort('amount', undefined)

        expect([state.sortColumn, state.isSortDescending])
            .toEqual(['amount', false])
    })

    it('Should keep current sort without explicit column', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.sortBy('amount')
        state.sortBy('amount')
        state.applySort(undefined, false)

        expect([state.sortColumn, state.isSortDescending])
            .toEqual(['amount', true])
    })
})