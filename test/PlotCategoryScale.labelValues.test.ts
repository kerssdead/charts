import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { CONTINUOUS_AXIS, CONTINUOUS_SLOTS, EVEN_SLOTS } from './PlotCategoryScaleTestData'

describe('Getting plot category label values', () => {
    it('Should label every slot of even scale', () => {
        expect(PlotCategoryScale.fromLeft(EVEN_SLOTS, 0, 1000).labelValues)
            .toEqual([0, 1, 2, 3])
    })

    it('Should label ticks of continuous scale', () => {
        expect(PlotCategoryScale.fromLeft(CONTINUOUS_SLOTS, 0, 1000, CONTINUOUS_AXIS).labelValues)
            .toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40])
    })
})