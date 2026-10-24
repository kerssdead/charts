import { getInnerRadiusRatio } from '@/helpers/Geometry'

describe('Getting inner radius ratio', () => {
    it('Should convert percent to ratio', () => {
        expect(getInnerRadiusRatio(50, 0))
            .toBe(.5)
    })

    it('Should use default percent for not finite value', () => {
        expect(getInnerRadiusRatio(NaN, 70))
            .toBe(.7)
        expect(getInnerRadiusRatio(undefined as unknown as number, 70))
            .toBe(.7)
    })

    it('Should clamp percent between 0 and 100', () => {
        expect(getInnerRadiusRatio(150, 0))
            .toBe(1)
        expect(getInnerRadiusRatio(-5, 70))
            .toBe(0)
    })
})