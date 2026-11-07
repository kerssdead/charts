import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import RenderItemLine from '@/types/RenderItemLine'
import { addColumnBreakMark } from '@/render/plot/PlotBreakMarks'

const getStops = (units: Units, left: number, right: number, top: number) => {
    const items = QueueItemsBuilder.build((builder: QueueItemsBuilder) => {
        addColumnBreakMark(builder, units, left, right, top)
    })

    return (items[0].shape as RenderItemLine).absolute
}

describe('Adding column break mark', () => {
    it('Should cross column with a slant below its top', () => {
        expect(getStops(new Units({ x: 1, y: 1 }), 100, 200, 50))
            .toEqual([{ x: 100, y: 61 }, { x: 200, y: 55 }])
    })

    it('Should keep offset and slant in pixels', () => {
        expect(getStops(new Units({ x: 1, y: 2 }), 100, 200, 50))
            .toEqual([{ x: 100, y: 72 }, { x: 200, y: 60 }])
    })
})