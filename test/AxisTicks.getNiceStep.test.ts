import { getNiceStep } from '@/helpers/AxisTicks'

describe('Getting nice step', () => {
    it('Should round step up to nearest nice multiplier of its magnitude', () => {
        expect(getNiceStep(10.44))
            .toBe(20)
        expect(getNiceStep(2.2))
            .toBe(2.5)
        expect(getNiceStep(0.3))
            .toBe(0.5)
    })

    it('Should keep step that is already nice', () => {
        expect(getNiceStep(100))
            .toBe(100)
    })

    it('Should use given multipliers', () => {
        expect(getNiceStep(7, [1, 2, 5, 10]))
            .toBe(10)
        expect(getNiceStep(3, [1, 2, 5, 10]))
            .toBe(5)
    })
})