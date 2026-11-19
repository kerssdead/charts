import { lerp } from '@/helpers/Geometry'

describe('Interpolating linearly', () => {
    it('Should give the ends at 0 and 1', () => {
        expect(lerp(10, 20, 0))
            .toBe(10)
        expect(lerp(10, 20, 1))
            .toBe(20)
    })

    it('Should give the midpoint at .5', () => {
        expect(lerp(10, 20, .5))
            .toBe(15)
    })

    it('Should interpolate downwards', () => {
        expect(lerp(20, 10, .25))
            .toBe(17.5)
    })

    it('Should extrapolate outside 0..1', () => {
        expect(lerp(10, 20, 2))
            .toBe(30)
    })
})