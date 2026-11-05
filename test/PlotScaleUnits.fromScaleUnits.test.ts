import { fromScaleUnits } from '@/render/plot/PlotScaleUnits'

describe('Converting scale units to value', () => {
    it('Should keep units on linear scale', () => {
        expect(fromScaleUnits(250, false))
            .toBe(250)
    })

    it('Should raise ten to units on log scale', () => {
        expect(fromScaleUnits(3, true))
            .toBe(1000)
    })
})