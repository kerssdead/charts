import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'

const create = (xScale: PlotScaleType, ...xs: number[]) => {
    const slots = getSlots([{ values: xs.map(x => ({ x, y: 1 })) } as PlotSeries], PlotAxisType.Number)

    return PlotContinuousAxis.create(slots, PlotAxisType.Number, xScale)!
}

describe('Getting plot continuous axis ratio', () => {
    it('Should place value proportionally between first and last slot', () => {
        const axis = create(PlotScaleType.Linear, 0, 10, 40)

        expect([0, 10, 40].map(x => axis.getRatio(x)))
            .toEqual([0, 0.25, 1])
    })

    it('Should place value by its logarithm on log scale', () => {
        expect(create(PlotScaleType.Log, 1, 10, 100).getRatio(10))
            .toBe(0.5)
    })
})