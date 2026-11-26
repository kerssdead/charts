import ToggleSet from '@/types/ToggleSet'
import Sector from '@/types/Sector'

describe('Clearing toggle set', () => {
    it('Should drop every toggled item', () => {
        const toggles = new ToggleSet<Sector>()
        const first = new Sector({ id: 'a' })
        const second = new Sector({ id: 'b' })

        toggles.toggle(first)
        toggles.toggle(second)
        toggles.clear()

        expect([toggles.has(first), toggles.has(second)])
            .toEqual([false, false])
    })

    it('Should toggle items on again after clearing', () => {
        const toggles = new ToggleSet<Sector>()
        const sector = new Sector({ id: 'a' })

        toggles.toggle(sector)
        toggles.clear()
        toggles.toggle(sector)

        expect(toggles.has(sector))
            .toBe(true)
    })
})