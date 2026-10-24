import SegmentedBarProcess from '@/render/SegmentedBarProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import { COORDS_MAX_X } from '@/static/constants/Index'
import ProcessSettings from '@/types/ProcessSettings'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000' }))

const PIXEL = { x: 5000 / 1000, y: 5000 / 40 }

const SETTINGS: ProcessSettings = { valuePostfix: undefined }

const BAR = { x: 7 * PIXEL.x, width: COORDS_MAX_X - 14 * PIXEL.x }

function getItems(data: Partial<SegmentedBarData>) {
    const process = new SegmentedBarProcess({ values: [], stops: [], ...data } as SegmentedBarData, PIXEL, SETTINGS)

    return new Map(QueueItemsBuilder.build(process.getData()).map(item => [item.key!, item]))
}

function getRects(data: Partial<SegmentedBarData>) {
    return new Map([...getItems(data)].map(([key, item]) => [key, item.shape as RenderItemRectangle]))
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

    it('Should scale parts to 100% in percentage mode and show empty track', () => {
        const rects = getRects({ percentageMode: true, values: [part('a', 20), part('b', 30)], stops: [stop('value', 60)] })

        expect(rects.get('segmented-bar-part-a')!.absolute.width).toBeCloseTo(BAR.width * .2)
        expect(rects.get('segmented-bar-part-b')!.absolute.x).toBeCloseTo(BAR.x + BAR.width * .2)
        expect(rects.get('segmented-bar-part-b')!.absolute.width).toBeCloseTo(BAR.width * .3)
        expect(rects.get('segmented-bar-track')!.absolute.width).toBeCloseTo(BAR.width)
        expect(rects.get('segmented-bar-stop-value')!.absolute.x).toBeCloseTo(BAR.x + BAR.width * .6)
    })

    it('Should cut parts over 100% at the bar end in percentage mode', () => {
        const rects = getRects({ percentageMode: true, values: [part('a', 70), part('b', 40), part('c', 10)] })

        expect(rects.get('segmented-bar-part-b')!.absolute.width).toBeCloseTo(BAR.width * .3)
        expect(rects.has('segmented-bar-part-c')).toBe(false)
        expect(rects.has('segmented-bar-track')).toBe(false)
    })

    it('Should use sum of parts without percentage mode', () => {
        const rects = getRects({ values: [part('a', 20), part('b', 60)] })

        expect(rects.get('segmented-bar-part-a')!.absolute.width).toBeCloseTo(BAR.width / 4)
        expect(rects.has('segmented-bar-track')).toBe(false)
    })

    it('Should show track and scale stops to the largest one when there are no parts', () => {
        const rects = getRects({ values: [part('a', 0)], stops: [stop('small', 1), stop('large', 4), stop('percent', '50%')] })

        expect(rects.get('segmented-bar-track')!.absolute.width).toBeCloseTo(BAR.width)
        expect(rects.get('segmented-bar-stop-small')!.absolute.x).toBeCloseTo(BAR.x + BAR.width / 4)
        expect(rects.get('segmented-bar-stop-large')!.absolute.x).toBeCloseTo(BAR.x + BAR.width - 3 * PIXEL.x)
        expect(rects.get('segmented-bar-stop-percent')!.absolute.x).toBeCloseTo(BAR.x + BAR.width / 2)
    })

    it('Should be empty only without parts and stops', () => {
        const create = (stops: SegmentedBarStop[]) => new SegmentedBarProcess({ values: [part('a', 0)], stops } as SegmentedBarData, PIXEL, SETTINGS)

        expect(create([]).isEmpty()).toBe(true)
        expect(create([stop('b', 1)]).isEmpty()).toBe(false)
    })

    it('Should show percent values in tooltips in percentage mode', () => {
        const items = getItems({
            percentageMode: true,
            values: [new Sector({ id: 'a', label: 'Lorem', value: 15, color: '#ff0000' })],
            stops: [new SegmentedBarStop({ id: 'b', label: 'Ipsum', value: 40, color: '#0000ff' })]
        })

        expect(items.get('segmented-bar-part-a')!.tooltipHtml).toContain('>Lorem\n15%</div>')
        expect(items.get('segmented-bar-stop-b')!.tooltipHtml).toContain('>Ipsum\n40%</div>')
    })

    it('Should show string data in tooltip and pass object data to item', () => {
        const items = getItems({
            values: [
                new Sector({ id: 'text', label: 'Lorem', value: 1, color: '#ff0000', data: 'Ipsum: 7<br/>Dolor: <b>9</b>' }),
                new Sector({ id: 'object', label: 'Amet', value: 1, color: '#ff0000', data: { Sit: '9' } })
            ]
        })

        const text = items.get('segmented-bar-part-text')!
        const object = items.get('segmented-bar-part-object')!

        expect(text.tooltipHtml).toContain('>Lorem\nIpsum: 7\nDolor: &lt;b&gt;9&lt;/b&gt;\n1.00 (50%)</div>')
        expect(text.data).toBeNull()
        expect(object.tooltipHtml).toContain('>Amet\n1.00 (50%)</div>')
        expect(object.data).toEqual({ Sit: '9' })
    })
})
