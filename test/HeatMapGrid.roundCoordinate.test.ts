import { roundCoordinate } from '@/render/heatMap/HeatMapGrid'

describe('Rounding a coordinate', () => {
    it('Should keep two decimals', () => {
        expect(roundCoordinate(1.23456))
            .toBe(1.23)
    })

    it('Should drop trailing zeros', () => {
        expect(roundCoordinate(5))
            .toBe(5)
        expect(roundCoordinate(2.5))
            .toBe(2.5)
    })

    it('Should round half up on the second decimal', () => {
        expect(roundCoordinate(.126))
            .toBe(.13)
    })
})