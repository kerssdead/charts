import ChartViewState from '@/types/ChartViewState'
import TreeBarRow from '@/types/TreeBarRow'
import { isDisabledByFlag } from './ViewStateTestData'

const row = (id: string, expanded?: boolean) => new TreeBarRow({ id, expanded })

describe('Applying expanded rows', () => {
    it('Should keep expanded rows without explicit value and respect explicit collapse', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applyExpanded([row('a', true), row('b', true)])
        state.applyExpanded([row('a'), row('b', false)])

        expect([state.isExpanded(row('a')), state.isExpanded(row('b'))])
            .toEqual([true, false])
    })

    it('Should drop expanded state of removed rows', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applyExpanded([row('a', true)])
        state.applyExpanded([row('b')])
        state.applyExpanded([row('a')])

        expect(state.isExpanded(row('a')))
            .toBe(false)
    })
})