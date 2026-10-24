import { getRadiansPerUnit } from '@/render/pie/PieSlices'

describe('Getting radians per unit', () => {
    it('Should spread full circle over total', () => {
        expect(getRadiansPerUnit(4))
            .toBeCloseTo(Math.PI / 2)
    })

    it('Should return 0 for zero total', () => {
        expect(getRadiansPerUnit(0))
            .toBe(0)
    })
})