import Angle from '@/helpers/Angle'

describe('Normalizing an angle', () => {
    it('Should keep angles inside the range', () => {
        expect(Angle.normalize(1))
            .toBeCloseTo(1)
        expect(Angle.normalize(-1))
            .toBeCloseTo(-1)
    })

    it('Should wrap angles above pi', () => {
        expect(Angle.normalize(Math.PI * 1.5))
            .toBeCloseTo(-Math.PI / 2)
    })

    it('Should wrap angles below minus pi', () => {
        expect(Angle.normalize(-Math.PI * 1.5))
            .toBeCloseTo(Math.PI / 2)
    })

    it('Should wrap full turns to zero', () => {
        expect(Angle.normalize(Math.PI * 4))
            .toBeCloseTo(0)
    })
})