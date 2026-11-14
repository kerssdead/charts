import ChartViewState from '@/types/ChartViewState'
import Sector from '@/types/Sector'
import { isDisabledByFlag } from './ViewStateTestData'

const sector = (id: string, pinned?: boolean) => new Sector({ id, pinned })

describe('Applying pinned sectors', () => {
    it('Should pin sectors marked in data', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applyPinned([sector('a', true), sector('b')])

        expect([state.isPinned(sector('a')), state.isPinned(sector('b'))])
            .toEqual([true, false])
    })

    it('Should keep pins without explicit value and respect explicit unpin', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applyPinned([sector('a', true), sector('b', true)])
        state.applyPinned([sector('a'), sector('b', false)])

        expect([state.isPinned(sector('a')), state.isPinned(sector('b'))])
            .toEqual([true, false])
    })

    it('Should drop pins of removed sectors', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.applyPinned([sector('a', true)])
        state.applyPinned([sector('b')])
        state.applyPinned([sector('a')])

        expect(state.isPinned(sector('a')))
            .toBe(false)
    })
})