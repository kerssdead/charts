import HoverMap from '@/types/HoverMap'
import HoverProgress from '@/types/HoverProgress'

describe('Listing hover map entries', () => {
    it('Should list every updated key with its hover progress', () => {
        const map = new HoverMap<number>()

        jest.replaceProperty(HoverProgress, 'isInstant', true)

        map.update([[1, true], [2, false]], 0)

        expect([...map.entries()].map(([key, hover]) => [key, hover.isIdle]))
            .toEqual([[1, false], [2, true]])
    })

    it('Should list every updated key', () => {
        const map = new HoverMap<number>()

        jest.replaceProperty(HoverProgress, 'isInstant', true)

        map.update([[1, true], [2, false]], 0)

        expect([...map.keys()])
            .toEqual([1, 2])
    })
})

describe('Getting hover map values', () => {
    it('Should get a hover progress by key', () => {
        const map = new HoverMap<number>()

        jest.replaceProperty(HoverProgress, 'isInstant', true)

        map.update([[1, true]], 0)

        expect(map.get(1)?.isIdle)
            .toBe(false)
        expect(map.get(2))
            .toBeUndefined()
    })

    it('Should return the eased value or zero for an unknown key', () => {
        const map = new HoverMap<number>()

        jest.replaceProperty(HoverProgress, 'isInstant', true)

        map.update([[1, true]], 0)

        expect(map.value(1))
            .toBe(1)
        expect(map.value(2))
            .toBe(0)
    })
})

describe('Clearing hover map', () => {
    it('Should drop all hovers and stop animating', () => {
        const map = new HoverMap<number>()

        jest.replaceProperty(HoverProgress, 'isInstant', true)

        map.update([[1, true]], 0)
        map.clear()

        expect([...map.keys()])
            .toEqual([])
        expect(map.isAnimating)
            .toBe(false)
        expect(map.value(1))
            .toBe(0)
    })
})