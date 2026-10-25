import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType } from '@/static/Enums'

const series = (...xs: (number | string)[]) => ({ values: xs.map(x => ({ x, y: 1 })) }) as PlotSeries

describe('Getting plot slots', () => {
    it('Should keep unique x values from all series', () => {
        expect(getSlots([series('a', 'b'), series('b', 'c')], PlotAxisType.Text).values)
            .toEqual(['a', 'b', 'c'])
    })

    it('Should index slots by x string', () => {
        const slots = getSlots([series(5, 3)], PlotAxisType.Text)

        expect(slots.index.get('5'))
            .toBe(0)
        expect(slots.index.get('3'))
            .toBe(1)
    })

    it('Should keep text slots in original order', () => {
        expect(getSlots([series('10', '2', '1')], PlotAxisType.Text).values)
            .toEqual(['10', '2', '1'])
    })

    it('Should sort number slots numerically', () => {
        expect(getSlots([series(10, 2, 1)], PlotAxisType.Number).values)
            .toEqual([1, 2, 10])
    })

    it('Should sort date slots chronologically', () => {
        expect(getSlots([series('2025-03-01', '2025-01-01', '2025-02-01')], PlotAxisType.Date).values)
            .toEqual(['2025-01-01', '2025-02-01', '2025-03-01'])
    })

    it('Should keep original order when some number slots are not numbers', () => {
        expect(getSlots([series(10, 'x', 1)], PlotAxisType.Number).values)
            .toEqual([10, 'x', 1])
    })

    it('Should return no slots for no series', () => {
        expect(getSlots([], PlotAxisType.Number).values)
            .toEqual([])
    })
})