import PlotValueScale from '@/render/plot/PlotValueScale'
import { PlotScaleType } from '@/static/Enums'

describe('Getting plot value baseline', () => {
    it('Should put linear baseline at zero value', () => {
        expect(PlotValueScale.fromBottom([-50, 0, 50], 1000, 800).baseline)
            .toBe(600)
        expect(PlotValueScale.fromLeft([0, 100], 100, 1000).baseline)
            .toBe(100)
    })

    it('Should put log baseline at scale start', () => {
        expect(PlotValueScale.fromBottom([1, 10, 100], 1000, 800, PlotScaleType.Log).baseline)
            .toBe(1000)
        expect(PlotValueScale.fromLeft([10, 100], 100, 1000, PlotScaleType.Log).baseline)
            .toBe(100)
    })
})