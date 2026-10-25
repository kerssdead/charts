import PlotValueScale from '@/render/plot/PlotValueScale'

describe('Getting plot value length per unit', () => {
    it('Should divide length by value range', () => {
        expect(PlotValueScale.fromLeft([0, 100], 0, 1000).lengthPerUnit)
            .toBe(10)
        expect(PlotValueScale.fromBottom([-20, 20], 1000, 800).lengthPerUnit)
            .toBe(20)
    })

    it('Should be zero for less than two values', () => {
        expect(PlotValueScale.fromLeft([7], 0, 1000).lengthPerUnit)
            .toBe(0)
    })

    it('Should be zero for flat range', () => {
        expect(PlotValueScale.fromLeft([7, 7], 0, 1000).lengthPerUnit)
            .toBe(0)
    })
})