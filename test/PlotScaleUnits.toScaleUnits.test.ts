import { toScaleUnits } from '@/render/plot/PlotScaleUnits'

describe('Converting value to scale units', () => {
    it('Should keep value on linear scale', () => {
        expect(toScaleUnits(250, false))
            .toBe(250)
    })

    it('Should take decimal logarithm on log scale', () => {
        expect(toScaleUnits(1000, true))
            .toBe(3)
    })
})