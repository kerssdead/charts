import TreeBarData, { applyTreeBarViewState } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import ChartViewState from '@/types/ChartViewState'
import { isDisabledByFlag } from './ViewStateTestData'

describe('Applying tree bar view state', () => {
    it('Should apply expanded nested rows and sort from data', () => {
        const child = new TreeBarRow({ id: 'b', expanded: true })
        const parent = new TreeBarRow({ id: 'a', children: [child] })
        const state = new ChartViewState(isDisabledByFlag)

        applyTreeBarViewState({ values: [parent], sortColumn: 'amount', sortDescending: true } as TreeBarData, state)

        expect([state.expanded.has(parent), state.expanded.has(child), state.sort.column, state.sort.isDescending])
            .toEqual([false, true, 'amount', true])
    })
})