import { clamp } from '@/helpers/Geometry'

describe('Clamping a value', () => {
    it('Should keep a value inside the range', () => {
        expect(clamp(5, 0, 10))
            .toBe(5)
    })

    it('Should limit a value to the minimum and maximum', () => {
        expect(clamp(-5, 0, 10))
            .toBe(0)
        expect(clamp(15, 0, 10))
            .toBe(10)
    })

    it('Should keep values equal to the bounds', () => {
        expect(clamp(0, 0, 10))
            .toBe(0)
        expect(clamp(10, 0, 10))
            .toBe(10)
    })
})