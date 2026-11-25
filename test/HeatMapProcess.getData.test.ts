import HeatMapProcess from '@/render/heatMap/HeatMapProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemImage from '@/types/RenderItemImage'
import RenderItemText from '@/types/RenderItemText'
import RenderItemCells from '@/types/RenderItemCells'
import { getPackedAlpha } from '@/helpers/PackedColor'
import HeatMapData from '@/types/data/HeatMapData'
import Formatter from '@/helpers/Formatter'
import { getImage } from '@/helpers/Images'
import { LIGHT_THEME } from '@/Theme'
import { createState } from './ViewStateTestData'
import { labeled, points } from './HeatMapTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

jest.mock('@/helpers/Images', () => ({
    getImage: jest.fn(),
    onImageLoad: jest.fn(() => jest.fn())
}))

const PIXEL = { x: 5, y: 5 }

const create = (data: HeatMapData) => {
    return new HeatMapProcess(data, PIXEL, { valuePostfix: undefined, theme: LIGHT_THEME }, createState(data))
}

const getItems = (data: HeatMapData) => {
    return new Map(QueueItemsBuilder.build(create(data).getData()).map(item => [item.key ?? '', item]))
}

const CELLS = (): [string, string, number][] => [['a', 'p', 1], ['b', 'p', 5], ['a', 'q', 3]]

beforeEach(() => (getImage as jest.Mock).mockReturnValue(null))

describe('Getting heat map data', () => {
    it('Should draw cells, axes and the scale', () => {
        const keys = [...getItems(labeled(CELLS())).keys()]

        expect(keys)
            .toEqual(expect.arrayContaining([
                'heat-cells',
                'heat-x-label-0',
                'heat-y-label-0',
                'heat-scale',
                'heat-scale-min',
                'heat-scale-max'
            ]))
        expect(keys)
            .not.toContain('heat-field')
    })

    it('Should draw a field instead of cells when smooth', () => {
        const keys = [...getItems(labeled(CELLS(), { smooth: true })).keys()]

        expect(keys)
            .toContain('heat-field')
        expect(keys)
            .not.toContain('heat-cells')
    })

    it('Should write the value range under the scale', () => {
        const items = getItems(labeled(CELLS()))

        expect((items.get('heat-scale-min')?.shape as RenderItemText).value)
            .toBe(Formatter.value(1, undefined, undefined))
        expect((items.get('heat-scale-max')?.shape as RenderItemText).value)
            .toBe(Formatter.value(5, undefined, undefined))
    })

    it('Should write the range of the field when smooth', () => {
        const items = getItems(labeled(CELLS(), { smooth: true }))

        expect((items.get('heat-scale-max')?.shape as RenderItemText).value)
            .toBe(Formatter.value(5, undefined, undefined))
    })

    it('Should leave out axes when they are disabled', () => {
        const keys = [...getItems(labeled(CELLS(), { disableAxes: true })).keys()]

        expect(keys.some(key => key.startsWith('heat-x-label') || key.startsWith('heat-y-label')))
            .toBe(false)
    })

    it('Should leave out axes for points', () => {
        const keys = [...getItems(points([[10, 10, 1]], { width: 100, height: 100 })).keys()]

        expect(keys.some(key => key.startsWith('heat-x-label')))
            .toBe(false)
    })

    it('Should add axis titles', () => {
        const keys = [...getItems(labeled(CELLS(), { xTitle: 'Day', yTitle: 'Hour' })).keys()]

        expect(keys)
            .toEqual(expect.arrayContaining(['heat-x-title', 'heat-y-title']))
    })

    it('Should draw cells of points as bins', () => {
        const items = getItems(points([[10, 10, 1], [90, 90, 2]], { width: 100, height: 100 }))
        const { cells } = items.get('heat-cells')?.shape as RenderItemCells

        expect([...(cells?.colors ?? [])].filter(color => getPackedAlpha(color) > 0))
            .toHaveLength(2)
    })

    it('Should draw nothing while the image size is not known', () => {
        expect(create(labeled(CELLS(), { image: 'plan.png' })).getData())
            .toEqual([])
    })

    it('Should draw straight away when the data gives the extent', () => {
        const keys = [...getItems(points([[10, 10, 1]], { image: 'plan.png', width: 100, height: 100 })).keys()]

        expect(keys[0])
            .toBe('heat-image')
    })

    it('Should draw the image under everything once it has loaded', () => {
        (getImage as jest.Mock).mockReturnValue({ naturalWidth: 800, naturalHeight: 400 })

        const keys = [...getItems(labeled(CELLS(), { image: 'plan.png' })).keys()]

        expect(keys[0])
            .toBe('heat-image')
        expect(keys.length)
            .toBeGreaterThan(5)
    })

    it('Should fit the map to the proportions of the loaded image', () => {
        (getImage as jest.Mock).mockReturnValue({ naturalWidth: 800, naturalHeight: 400 })

        const { box } = getItems(labeled(CELLS(), { image: 'plan.png' })).get('heat-image')?.shape as RenderItemImage

        expect(box?.width / box?.height)
            .toBeCloseTo(2, 1)
    })

    it('Should prefer the extent of the data to the image size', () => {
        (getImage as jest.Mock).mockReturnValue({ naturalWidth: 800, naturalHeight: 400 })

        const data = labeled(CELLS(), { image: 'plan.png', width: 100, height: 100 })
        const { box } = getItems(data).get('heat-image')?.shape as RenderItemImage

        expect(box?.width / box?.height)
            .toBeCloseTo(1, 1)
    })

    it('Should keep the map inside the chart', () => {
        const { box } = getItems(labeled(CELLS())).get('heat-cells')?.shape as RenderItemCells

        expect(box.x + box.width)
            .toBeLessThanOrEqual(5000)
    })

    it('Should draw more cells than the stack can spread', () => {
        const many = Array.from({ length: 200000 }, (_, index) => ['c' + (index % 500), 'r' + Math.floor(index / 500), index])

        expect(() => create(labeled(many as [string, string, number][])).getData())
            .not.toThrow()
    })
})