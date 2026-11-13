import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'

const create = (xs: (number | string)[], xType: PlotAxisType, xScale: PlotScaleType) => {
    const slots = getSlots([{ values: xs.map(x => ({ x, y: 1 })) } as PlotSeries], xType)

    return PlotContinuousAxis.create(slots, xType, xScale)
}

describe('Creating plot continuous axis', () => {
    it('Should take slot values and ticks for linear numbers', () => {
        const axis = create([40, 0, 10], PlotAxisType.Number, PlotScaleType.Linear)

        expect(axis?.slotValues)
            .toEqual([0, 10, 40])
        expect(axis?.ticks)
            .toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40])
    })

    it('Should take powers of ten as log ticks', () => {
        expect(create([2, 50000], PlotAxisType.Number, PlotScaleType.Log)?.ticks)
            .toEqual([10, 100, 1000, 10000])
    })

    it('Should use timestamps and calendar ticks for dates', () => {
        const axis = create(['2025-01-15', '2025-12-20'], PlotAxisType.Date, PlotScaleType.Linear)

        expect(axis?.slotValues)
            .toEqual([new Date(2025, 0, 15).getTime(), new Date(2025, 11, 20).getTime()])
        expect(axis?.ticks)
            .toEqual([2, 4, 6, 8, 10].map(month => new Date(2025, month, 1).getTime()))
    })

    it('Should use linear scale for dates on log scale', () => {
        const axis = create(['2025-01-01', '2025-01-03', '2025-01-05'], PlotAxisType.Date, PlotScaleType.Log)

        expect(axis?.getRatio(new Date(2025, 0, 3).getTime()))
            .toBe(0.5)
    })

    it('Should not create axis for category scale or text values', () => {
        expect(create([0, 10], PlotAxisType.Number, PlotScaleType.Category))
            .toBeNull()
        expect(create([0, 10], PlotAxisType.Text, PlotScaleType.Linear))
            .toBeNull()
    })

    it('Should not create axis for values that can not be placed', () => {
        expect(create([0, 'x'], PlotAxisType.Number, PlotScaleType.Linear))
            .toBeNull()
        expect(create([0, 10], PlotAxisType.Number, PlotScaleType.Log))
            .toBeNull()
    })

    it('Should not create axis for less than two different values', () => {
        expect(create([5], PlotAxisType.Number, PlotScaleType.Linear))
            .toBeNull()
        expect(create([], PlotAxisType.Number, PlotScaleType.Linear))
            .toBeNull()
    })
})