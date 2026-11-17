import HoverMap from '@/types/HoverMap'

describe('Updating hover map', () => {
    it('Should animate hovered keys by default', () => {
        const map = new HoverMap<number>()

        map.update([[1, true]], 0)

        expect(map.isAnimating)
            .toBe(true)
    })

    it('Should not animate when the update is instant', () => {
        const map = new HoverMap<number>()

        map.update([[1, true]], 0, true)

        expect(map.isAnimating)
            .toBe(false)
    })
})
