import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { CONTINUOUS_AXIS, CONTINUOUS_SLOTS, EVEN_SLOTS } from './PlotCategoryScaleTestData'

describe('Getting plot category min label distance', () => {
    it('Should be slot size on even scale', () => {
        expect(PlotCategoryScale.fromLeft(EVEN_SLOTS, 0, 1000).minLabelDistance)
            .toBe(242.5)
    })

    it('Should be closest tick distance on continuous scale', () => {
        expect(PlotCategoryScale.fromBottom(CONTINUOUS_SLOTS, 1000, 1000, CONTINUOUS_AXIS).minLabelDistance)
            .toBeCloseTo(100)
    })
})