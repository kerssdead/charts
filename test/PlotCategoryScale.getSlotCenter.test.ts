import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType } from '@/static/Enums'

const slots = getSlots(
    [{ values: Array.from({ length: 4 }, (_, i) => ({ x: i, y: 1 })) } as PlotSeries],
    PlotAxisType.Number
)

describe('Getting plot category slot center', () => {
    it('Should add half step to the right', () => {
        expect(PlotCategoryScale.fromLeft(slots, 0, 1000).getSlotCenter(0))
            .toBe(136.25)
    })

    it('Should add half step upwards', () => {
        expect(PlotCategoryScale.fromBottom(slots, 1000, 1000).getSlotCenter(0))
            .toBe(863.75)
    })
})