import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { CONTINUOUS_AXIS, CONTINUOUS_SLOTS, EVEN_SLOTS } from './PlotCategoryScaleTestData'

describe('Checking plot category scale is continuous', () => {
    it('Should not be continuous without continuous axis', () => {
        expect(PlotCategoryScale.fromLeft(EVEN_SLOTS, 0, 1000).isContinuous)
            .toBe(false)
    })

    it('Should be continuous with continuous axis', () => {
        expect(PlotCategoryScale.fromLeft(CONTINUOUS_SLOTS, 0, 1000, CONTINUOUS_AXIS).isContinuous)
            .toBe(true)
    })
})