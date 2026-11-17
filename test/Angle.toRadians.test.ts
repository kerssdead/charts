import Angle from '@/helpers/Angle'

describe('Converting degrees to radians', () => {
    it('Should convert zero', () => {
        expect(Angle.toRadians(0))
            .toBe(0)
    })

    it('Should convert common angles', () => {
        expect(Angle.toRadians(90))
            .toBeCloseTo(Math.PI / 2)
        expect(Angle.toRadians(180))
            .toBeCloseTo(Math.PI)
    })

    it('Should convert negative angles', () => {
        expect(Angle.toRadians(-90))
            .toBeCloseTo(-Math.PI / 2)
    })
})