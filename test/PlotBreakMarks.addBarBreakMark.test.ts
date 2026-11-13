import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import RenderItemLine from '@/types/RenderItemLine'
import { addBarBreakMark } from '@/render/plot/PlotBreakMarks'

const getStops = (units: Units, top: number, bottom: number, end: number) => {
    const items = QueueItemsBuilder.build((builder: QueueItemsBuilder) => {
        addBarBreakMark(builder, units, { start: top, end: bottom }, end)
    })

    return (items[0].shape as RenderItemLine).absolute
}

describe('Adding bar break mark', () => {
    it('Should cross bar with a slant before its end', () => {
        expect(getStops(new Units({ x: 1, y: 1 }), 100, 200, 500))
            .toEqual([{ x: 489, y: 200 }, { x: 495, y: 100 }])
    })

    it('Should keep offset and slant in pixels', () => {
        expect(getStops(new Units({ x: 2, y: 1 }), 100, 200, 500))
            .toEqual([{ x: 478, y: 200 }, { x: 490, y: 100 }])
    })
})