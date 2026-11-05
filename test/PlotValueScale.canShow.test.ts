import PlotValueScale from '@/render/plot/PlotValueScale'
import { PlotScaleType } from '@/static/Enums'

describe('Checking plot value can be shown', () => {
    it('Should show any value on linear scale', () => {
        const scale = PlotValueScale.fromBottom([-100, 0, 100], 1000, 800)

        expect([-5, 0, 5].map(value => scale.canShow(value)))
            .toEqual([true, true, true])
    })

    it('Should show only positive values on log scale', () => {
        const scale = PlotValueScale.fromBottom([1, 10, 100], 1000, 800, PlotScaleType.Log)

        expect([-5, 0, 5].map(value => scale.canShow(value)))
            .toEqual([false, false, true])
    })
})