import PlotValueScale from '@/render/plot/PlotValueScale'

describe('Getting plot value at coordinate', () => {
    it('Should invert left to right mapping', () => {
        expect(PlotValueScale.fromLeft([0, 100], 100, 1000).getValue(600))
            .toBe(50)
    })

    it('Should invert bottom to top mapping', () => {
        expect(PlotValueScale.fromBottom([0, 100], 1000, 800).getValue(800))
            .toBe(25)
    })

    it('Should return zero for less than two values', () => {
        expect(PlotValueScale.fromBottom([10], 1000, 800).getValue(800))
            .toBe(0)
    })

    it('Should return zero for zero length', () => {
        expect(PlotValueScale.fromBottom([0, 100], 1000, 0).getValue(800))
            .toBe(0)
    })

    it('Should return first value for flat range', () => {
        expect(PlotValueScale.fromBottom([5, 5], 1000, 800).getValue(300))
            .toBe(5)
    })
})