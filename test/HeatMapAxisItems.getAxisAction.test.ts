import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemText from '@/types/RenderItemText'
import Units from '@/helpers/Units'
import { getAxisAction } from '@/render/heatMap/HeatMapAxisItems'
import { getEdges } from '@/render/heatMap/HeatMapLayout'
import { LABEL_GAP, PADDING } from '@/render/heatMap/HeatMapConstants'
import { labeled } from './HeatMapTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 5, y: 5 })

const AREA = { x: 100, y: 50, width: 400, height: 200 }

const FRAME = {
    units: UNITS,
    area: AREA,
    xEdges: getEdges(4, AREA.x, AREA.width),
    yEdges: getEdges(2, AREA.y, AREA.height)
}

const build = (extra: object = {}, cells: [string, string, number][] = []) => {
    const data = labeled([['a', 'p', 1], ['b', 'p', 1], ['c', 'p', 1], ['d', 'p', 1], ['a', 'q', 1], ...cells], extra)

    return new Map(QueueItemsBuilder.build(getAxisAction(data, FRAME)).map(item => [item.key ?? '', item]))
}

const textOf = (items: ReturnType<typeof build>, key: string) => items.get(key)?.shape as RenderItemText

describe('Getting the axis action', () => {
    it('Should label every column and row', () => {
        expect([...build().keys()])
            .toEqual([
                'heat-x-label-0',
                'heat-x-label-1',
                'heat-x-label-2',
                'heat-x-label-3',
                'heat-y-label-0',
                'heat-y-label-1'
            ])
    })

    it('Should center a column label under its column', () => {
        expect(textOf(build(), 'heat-x-label-0').absolute)
            .toEqual({ x: UNITS.x(150), y: UNITS.y(AREA.y + AREA.height + LABEL_GAP) })
    })

    it('Should put a row label to the left of its row', () => {
        expect(textOf(build(), 'heat-y-label-1').absolute)
            .toEqual({ x: UNITS.x(AREA.x - LABEL_GAP), y: UNITS.y(200) })
    })

    it('Should write the labels', () => {
        const items = build()

        expect([0, 1, 2, 3].map(index => textOf(items, `heat-x-label-${ index }`).value))
            .toEqual(['a', 'b', 'c', 'd'])
        expect([0, 1].map(index => textOf(items, `heat-y-label-${ index }`).value))
            .toEqual(['p', 'q'])
    })

    it('Should skip column labels that would overlap', () => {
        const wide = [['LLLLLLLLLL', 'p', 1]] as [string, string, number][]
        const items = build({ xLabels: Array.from({ length: 40 }, (_, index) => 'LLLLLLLLLL' + index) }, wide)

        expect([...items.keys()].filter(key => key.startsWith('heat-x-label')).length)
            .toBeLessThan(40)
        expect(items.has('heat-x-label-0'))
            .toBe(true)
    })

    it('Should skip row labels that would overlap', () => {
        const items = build({ yLabels: Array.from({ length: 40 }, (_, index) => 'row' + index) })

        expect([...items.keys()].filter(key => key.startsWith('heat-y-label')).length)
            .toBeLessThan(40)
    })

    it('Should write the titles', () => {
        const items = build({ xTitle: 'Weekday', yTitle: 'Hour' })

        expect(textOf(items, 'heat-x-title').value)
            .toBe('Weekday')
        expect(textOf(items, 'heat-y-title').value)
            .toBe('Hour')
    })

    it('Should center the horizontal title under the labels', () => {
        expect(textOf(build({ xTitle: 'Weekday' }), 'heat-x-title').absolute.x)
            .toBe(UNITS.x(AREA.x + AREA.width / 2))
    })

    it('Should rotate the vertical title and put it at the left edge', () => {
        const title = textOf(build({ yTitle: 'Hour' }), 'heat-y-title')

        expect(title.rotate)
            .toBeCloseTo(Math.PI * 1.5)
        expect(title.absolute.x)
            .toBe(UNITS.x(PADDING))
    })

    it('Should not add titles that are not set', () => {
        const items = build()

        expect(items.has('heat-x-title'))
            .toBe(false)
        expect(items.has('heat-y-title'))
            .toBe(false)
    })
})