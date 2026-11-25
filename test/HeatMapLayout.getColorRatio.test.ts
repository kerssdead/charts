import { getColorRatio } from '@/render/heatMap/HeatMapLayout'

describe('Getting color ratio', () => {
    it('Should give 0 at the minimum and 1 at the maximum', () => {
        expect(getColorRatio(10, 10, 30))
            .toBe(0)
        expect(getColorRatio(30, 10, 30))
            .toBe(1)
    })

    it('Should give the position inside the range', () => {
        expect(getColorRatio(15, 10, 30))
            .toBe(.25)
    })

    it('Should give 1 when all values are equal', () => {
        expect(getColorRatio(5, 5, 5))
            .toBe(1)
    })
})