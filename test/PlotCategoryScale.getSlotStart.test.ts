import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType } from '@/static/Enums'

const slots = getSlots(
    [{ values: Array.from({ length: 4 }, (_, i) => ({ x: i, y: 1 })) } as PlotSeries],
    PlotAxisType.Number
)

describe('Getting plot category slot start', () => {
    it('Should place slots after gaps from left', () => {
        const scale = PlotCategoryScale.fromLeft(slots, 100, 1000)

        expect(scale.getSlotStart(0))
            .toBe(130)
        expect(scale.getSlotStart(1))
            .toBe(372.5)
        expect(scale.getSlotStart(3) + scale.step)
            .toBe(1070)
    })

    it('Should place slots after gaps from bottom upwards', () => {
        const scale = PlotCategoryScale.fromBottom(slots, 1000, 1000)

        expect(scale.getSlotStart(0))
            .toBe(970)
        expect(scale.getSlotStart(1))
            .toBe(727.5)
        expect(scale.getSlotStart(3) - scale.step)
            .toBe(30)
    })
})