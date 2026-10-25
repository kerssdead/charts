import PlotValueScale from '@/render/plot/PlotValueScale'

describe('Getting plot value coordinate', () => {
    it('Should map values from left to right', () => {
        const scale = PlotValueScale.fromLeft([0, 50, 100], 100, 1000)

        expect(scale.getCoordinate(0))
            .toBe(100)
        expect(scale.getCoordinate(50))
            .toBe(600)
        expect(scale.getCoordinate(100))
            .toBe(1100)
    })

    it('Should map values from bottom to top', () => {
        const scale = PlotValueScale.fromBottom([0, 100], 1000, 800)

        expect(scale.getCoordinate(0))
            .toBe(1000)
        expect(scale.getCoordinate(25))
            .toBe(800)
        expect(scale.getCoordinate(100))
            .toBe(200)
    })

    it('Should start range from first value', () => {
        expect(PlotValueScale.fromLeft([-100, 0, 100], 0, 1000).getCoordinate(0))
            .toBe(500)
    })

    it('Should return start for less than two values', () => {
        expect(PlotValueScale.fromLeft([], 100, 1000).getCoordinate(50))
            .toBe(100)
        expect(PlotValueScale.fromLeft([10], 100, 1000).getCoordinate(50))
            .toBe(100)
    })

    it('Should return start for flat range', () => {
        expect(PlotValueScale.fromBottom([5, 5], 1000, 800).getCoordinate(50))
            .toBe(1000)
    })
})