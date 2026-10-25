import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType } from '@/static/Enums'

const slots = (count: number) =>
    getSlots([{ values: Array.from({ length: count }, (_, i) => ({ x: i, y: 1 })) } as PlotSeries], PlotAxisType.Number)

describe('Creating plot category scale', () => {
    it('Should split length into equal steps with gaps between and around them', () => {
        const scale = PlotCategoryScale.fromLeft(slots(4), 0, 1000)

        expect(scale.gap)
            .toBe(30)
        expect(scale.step)
            .toBe(212.5)
        expect(scale.step * 4 + scale.gap * 5)
            .toBe(1000)
    })

    it('Should limit gap to a fifth of slot size', () => {
        expect(PlotCategoryScale.fromBottom(slots(4), 400, 400).gap)
            .toBe(20)
    })

    it('Should count slots', () => {
        expect(PlotCategoryScale.fromLeft(slots(3), 0, 1000).count)
            .toBe(3)
    })
})