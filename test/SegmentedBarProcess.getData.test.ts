import SegmentedBarProcess from '@/render/SegmentedBarProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import { COORDS_MAX_X } from '@/static/constants/Index'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff' }))

const PIXEL = { x: 5000 / 1000, y: 5000 / 40 }

const BAR = { x: 8 * PIXEL.x, width: COORDS_MAX_X - 16 * PIXEL.x }

function getRects(data: Partial<SegmentedBarData>) {
    const process = new SegmentedBarProcess({ values: [], stops: [], ...data } as SegmentedBarData, PIXEL, undefined)
    const items = QueueItemsBuilder.build(process.getData())

    return new Map(items.filter(item => item.key).map(item => [item.key!, item.shape as RenderItemRectangle]))
}

const part = (id: string, value: number) => new Sector({ id, value, color: '#ff0000' })

const stop = (id: string, value: number | string) => new SegmentedBarStop({ id, value, color: '#0000ff' })

describe('Getting segmented bar data', () => {
    it('Should lay out parts proportionally and skip zero parts', () => {
        const rects = getRects({ values: [part('a', 1), part('b', 0), part('c', 3)] })

        expect(rects.has('segmented-bar-part-b')).toBe(false)
        expect(rects.get('segmented-bar-part-a')!.absolute.width).toBeCloseTo(BAR.width / 4)
        expect(rects.get('segmented-bar-part-c')!.absolute.x).toBeCloseTo(BAR.x + BAR.width / 4)
    })

    it('Should apply minimal part width', () => {
        const rects = getRects({ values: [part('a', 1), part('b', 10000)] })

        expect(rects.get('segmented-bar-part-a')!.absolute.width).toBeCloseTo(4 * PIXEL.x)
    })

    it('Should place stops by value, by percent and clamp them', () => {
        const rects = getRects({
            values: [part('a', 1), part('b', 3)],
            stops: [stop('value', 1), stop('percent', ' 50% '), stop('outside', 100)]
        })

        expect(rects.get('segmented-bar-stop-value')!.absolute.x).toBeCloseTo(BAR.x + BAR.width / 4)
        expect(rects.get('segmented-bar-stop-percent')!.absolute.x).toBeCloseTo(BAR.x + BAR.width / 2)
        expect(rects.get('segmented-bar-stop-outside')!.absolute.x).toBeCloseTo(BAR.x + BAR.width - 3 * PIXEL.x)
    })
})
