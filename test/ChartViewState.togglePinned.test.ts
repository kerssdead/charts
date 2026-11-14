import ChartViewState from '@/types/ChartViewState'
import Sector from '@/types/Sector'
import { isDisabledByFlag } from './ViewStateTestData'

describe('Toggling pinned sector', () => {
    it('Should pin and unpin sector by id without changing it', () => {
        const state = new ChartViewState(isDisabledByFlag)
        const sector = new Sector({ id: 'a' })

        state.togglePinned(sector)

        const isPinnedAfterFirstToggle = state.isPinned(sector)

        state.togglePinned(sector)

        expect([isPinnedAfterFirstToggle, state.isPinned(sector), sector.pinned])
            .toEqual([true, false, undefined])
    })

    it('Should treat sectors with same id as one', () => {
        const state = new ChartViewState(isDisabledByFlag)

        state.togglePinned(new Sector({ id: 'a' }))

        expect([state.isPinned(new Sector({ id: 'a' })), state.isPinned(new Sector({ id: 'b' }))])
            .toEqual([true, false])
    })
})