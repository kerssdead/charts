import ToggleSet from '@/types/ToggleSet'
import Sector from '@/types/Sector'

const sector = (id: string, pinned?: boolean) => new Sector({ id, pinned })

const getPinned = (item: Sector) => item.pinned

describe('Applying toggle set flags', () => {
    it('Should toggle on items marked in data', () => {
        const toggles = new ToggleSet<Sector>()

        toggles.apply([sector('a', true), sector('b')], getPinned)

        expect([toggles.has(sector('a')), toggles.has(sector('b'))])
            .toEqual([true, false])
    })

    it('Should keep items without explicit flag and respect explicit false', () => {
        const toggles = new ToggleSet<Sector>()

        toggles.apply([sector('a', true), sector('b', true)], getPinned)
        toggles.apply([sector('a'), sector('b', false)], getPinned)

        expect([toggles.has(sector('a')), toggles.has(sector('b'))])
            .toEqual([true, false])
    })

    it('Should drop removed items', () => {
        const toggles = new ToggleSet<Sector>()

        toggles.apply([sector('a', true)], getPinned)
        toggles.apply([sector('b')], getPinned)
        toggles.apply([sector('a')], getPinned)

        expect(toggles.has(sector('a')))
            .toBe(false)
    })
})