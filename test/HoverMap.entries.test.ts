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
})