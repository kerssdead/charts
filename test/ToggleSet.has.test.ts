import ToggleSet from '@/types/ToggleSet'
import Sector from '@/types/Sector'

describe('Checking toggle set item', () => {
    it('Should not have items before toggling', () => {
        expect(new ToggleSet<Sector>().has(new Sector({ id: 'a' })))
            .toBe(false)
    })

    it('Should have an item with the same id as a toggled one', () => {
        const toggles = new ToggleSet<Sector>()

        toggles.toggle(new Sector({ id: 'a' }))

        expect([toggles.has(new Sector({ id: 'a' })), toggles.has(new Sector({ id: 'b' }))])
            .toEqual([true, false])
    })
})