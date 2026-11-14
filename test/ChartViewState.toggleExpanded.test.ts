import ChartViewState from '@/types/ChartViewState'
import TreeBarRow from '@/types/TreeBarRow'
import { isDisabledByFlag } from './ViewStateTestData'

describe('Toggling expanded row', () => {
    it('Should expand and collapse row by id without changing it', () => {
        const state = new ChartViewState(isDisabledByFlag)
        const row = new TreeBarRow({ id: 'a' })

        state.toggleExpanded(row)

        const isExpandedAfterFirstToggle = state.isExpanded(row)

        state.toggleExpanded(row)

        expect([isExpandedAfterFirstToggle, state.isExpanded(row), row.expanded])
            .toEqual([true, false, undefined])
    })
})