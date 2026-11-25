import { smoothstep } from '@/helpers/Geometry'

describe('Smoothing a step', () => {
    it('Should give the ends at 0 and 1', () => {
        expect(smoothstep(0))
            .toBe(0)
        expect(smoothstep(1))
            .toBe(1)
    })

    it('Should give the midpoint at .5', () => {
        expect(smoothstep(.5))
            .toBe(.5)
    })

    it('Should start and finish slower than linear', () => {
        expect(smoothstep(.25))
            .toBeCloseTo(.15625)
        expect(smoothstep(.75))
            .toBeCloseTo(.84375)
    })
})