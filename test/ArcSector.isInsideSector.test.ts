import { isInsideSector, PlacedSector } from '@/helpers/ArcSector'

const sector = (overrides: Partial<PlacedSector> = {}): PlacedSector => {
    return {
        radius: 10,
        innerRadius: 0,
        gap: 0,
        cornerRadius: 0,
        x: 0,
        y: 0,
        startAngle: 0,
        endAngle: Math.PI / 2,
        pull: 0,
        ...overrides
    }
}

describe('Checking sector hit', () => {
    it('Should hit points inside the sector', () => {
        expect(isInsideSector({ x: 5, y: 0 }, sector()))
            .toBe(true)
        expect(isInsideSector({ x: 0, y: 8 }, sector()))
            .toBe(true)
    })

    it('Should hit every point of a full circle regardless of pull', () => {
        const full = sector({ endAngle: Math.PI * 2, pull: 5 })

        expect(isInsideSector({ x: -7, y: -3 }, full))
            .toBe(true)
    })

    it('Should miss points beyond the outer radius', () => {
        expect(isInsideSector({ x: 15, y: 0 }, sector()))
            .toBe(false)
    })

    it('Should miss points inside the inner radius', () => {
        expect(isInsideSector({ x: 1, y: 0 }, sector({ innerRadius: 2 })))
            .toBe(false)
    })

    it('Should miss points beyond the sweep angle', () => {
        expect(isInsideSector({ x: -5, y: 0 }, sector()))
            .toBe(false)
    })

    it('Should miss points too close to the gap edge', () => {
        expect(isInsideSector({ x: 5, y: 1 }, sector({ gap: 4 })))
            .toBe(false)
    })

    it('Should hit points near a wide gap of a large sector', () => {
        const wide = sector({ endAngle: Math.PI, gap: 10 })

        expect(isInsideSector({ x: 1, y: 6 }, wide))
            .toBe(true)
    })

    it('Should miss points hidden behind the end edge of a large sector', () => {
        const wide = sector({ endAngle: Math.PI, gap: 10 })

        expect(isInsideSector({ x: -1, y: 2 }, wide))
            .toBe(false)
    })
})
