import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'

const create = (...xs: number[]) => {
    const slots = getSlots([{ values: xs.map(x => ({ x, y: 1 })) } as PlotSeries], PlotAxisType.Number)

    return PlotContinuousAxis.create(slots, PlotAxisType.Number, PlotScaleType.Linear)
}

describe('Getting plot continuous axis min slot distance', () => {
    it('Should take smallest ratio distance between neighbour slots', () => {
        expect(create(0, 10, 40)?.minSlotDistance)
            .toBe(0.25)
    })

    it('Should be whole axis for two slots', () => {
        expect(create(3, 7)?.minSlotDistance)
            .toBe(1)
    })
})