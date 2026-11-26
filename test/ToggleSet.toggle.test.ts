import ToggleSet from '@/types/ToggleSet'
import Sector from '@/types/Sector'

describe('Toggling toggle set item', () => {
    it('Should toggle item by id without changing it', () => {
        const toggles = new ToggleSet<Sector>()
        const sector = new Sector({ id: 'a' })

        toggles.toggle(sector)

        const isToggledAfterFirstToggle = toggles.has(sector)

        toggles.toggle(sector)

        expect([isToggledAfterFirstToggle, toggles.has(sector), sector.pinned])
            .toEqual([true, false, undefined])
    })

    it('Should treat items with same id as one', () => {
        const toggles = new ToggleSet<Sector>()

        toggles.toggle(new Sector({ id: 'a' }))

        expect([toggles.has(new Sector({ id: 'a' })), toggles.has(new Sector({ id: 'b' }))])
            .toEqual([true, false])
    })
})