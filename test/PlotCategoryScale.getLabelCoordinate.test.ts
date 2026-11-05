import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { CONTINUOUS_AXIS, CONTINUOUS_SLOTS, EVEN_SLOTS } from './PlotCategoryScaleTestData'

describe('Getting plot category label coordinate', () => {
    it('Should put even scale label at slot center', () => {
        const scale = PlotCategoryScale.fromLeft(EVEN_SLOTS, 0, 1000)

        expect(scale.getLabelCoordinate(2))
            .toBe(scale.getSlotCenter(2))
    })

    it('Should put continuous scale label at tick value', () => {
        const scale = PlotCategoryScale.fromLeft(CONTINUOUS_SLOTS, 0, 1000, CONTINUOUS_AXIS)

        expect(scale.getLabelCoordinate(1))
            .toBe(200)
        expect(scale.getLabelCoordinate(2))
            .toBe(scale.getSlotCenter(1))
    })
})