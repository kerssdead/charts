import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType } from '@/static/Enums'

const scale = PlotCategoryScale.fromLeft(
    getSlots([{ values: [{ x: 'a', y: 1 }, { x: 'b', y: 1 }] } as PlotSeries], PlotAxisType.Text),
    0,
    1000
)

describe('Getting plot category slot', () => {
    it('Should find slot of point x', () => {
        expect(scale.getSlot({ x: 'b', y: 5 }))
            .toBe(1)
    })

    it('Should fall back to first slot for unknown x', () => {
        expect(scale.getSlot({ x: 'z', y: 5 }))
            .toBe(0)
    })
})