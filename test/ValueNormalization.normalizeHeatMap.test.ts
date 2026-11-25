import { normalizeHeatMap } from '@/helpers/ValueNormalization'
import { prepareHeatMapCells } from '@/helpers/ValuePreparation'
import HeatMapData from '@/types/data/HeatMapData'

const normalize = (fields: Partial<HeatMapData> & { values: object[] }, numberLocale?: string) => {
    const data = { ...fields } as HeatMapData

    prepareHeatMapCells(data)
    normalizeHeatMap(data, numberLocale)

    return data
}

const cells = (values: [string, string, unknown][], extra: Partial<HeatMapData> = {}) => {
    return normalize({ values: values.map(([x, y, value]) => ({ x, y, value })), ...extra })
}

describe('Normalizing heat map', () => {
    it('Should parse the values of cells', () => {
        expect(cells([['a', 'p', '12'], ['b', 'p', 3]]).values.map(cell => cell.value))
            .toEqual([12, 3])
    })

    it('Should parse values with the number locale', () => {
        const data = normalize({ values: [{ x: 'a', y: 'p', value: '1.234,5' }] }, 'de-DE')

        expect(data.values[0].value)
            .toBe(1234.5)
    })

    it('Should drop cells without a usable value', () => {
        expect(cells([['a', 'p', 'abc'], ['b', 'p', NaN], ['c', 'p', 4]]).values.map(cell => cell.x))
            .toEqual(['c'])
    })

    it('Should keep the last cell of a repeated position', () => {
        const data = cells([['a', 'p', 1], ['b', 'p', 2], ['a', 'p', 5]])

        expect(data.values.map(cell => [cell.x, cell.value]))
            .toEqual([['a', 5], ['b', 2]])
    })

    it('Should list labels in order of appearance', () => {
        const data = cells([['b', 'q', 1], ['a', 'p', 1], ['b', 'p', 1]])

        expect(data.xLabels)
            .toEqual(['b', 'a'])
        expect(data.yLabels)
            .toEqual(['q', 'p'])
    })

    it('Should keep the order of given labels', () => {
        const data = cells([['a', 'p', 1], ['b', 'q', 1]], { xLabels: ['b', 'a'], yLabels: ['q', 'p'] })

        expect(data.xLabels)
            .toEqual(['b', 'a'])
        expect(data.yLabels)
            .toEqual(['q', 'p'])
    })

    it('Should drop cells outside the given labels', () => {
        const data = cells([['a', 'p', 1], ['b', 'p', 1], ['a', 'z', 1]], { xLabels: ['a'], yLabels: ['p'] })

        expect(data.values.map(cell => [cell.x, cell.y]))
            .toEqual([['a', 'p']])
    })

    it('Should repeat no label and write labels as text', () => {
        const data = normalize({
            values: [{ x: 'a', y: 'p', value: 1 }],
            xLabels: ['a', 'a', 5 as unknown as string],
            yLabels: ['p']
        })

        expect(data.xLabels)
            .toEqual(['a', '5'])
    })

    it('Should normalize the colors', () => {
        const data = cells([['a', 'p', 1]], { color: '#abc', colors: ['#123', '#456789'] })

        expect(data.color)
            .toBe('#aabbcc')
        expect(data.colors)
            .toEqual(['#112233', '#456789'])
    })

    it('Should parse numeric settings', () => {
        const data = normalize({
            values: [{ x: 'a', y: 'p', value: 1 }],
            width: '1200' as unknown as number,
            height: '800' as unknown as number,
            opacity: '.5' as unknown as number,
            radius: '40' as unknown as number
        })

        expect([data.width, data.height, data.opacity, data.radius])
            .toEqual([1200, 800, .5, 40])
    })

    it('Should leave numeric settings that are not set unset', () => {
        const data = cells([['a', 'p', 1]])

        expect(data.width)
            .toBeUndefined()
    })

    it('Should parse the coordinates of points', () => {
        const data = normalize({ values: [{ x: '10', y: '20', value: 1 }], resolution: 10 })

        expect([data.values[0].x, data.values[0].y])
            .toEqual([10, 20])
    })

    it('Should drop points without usable coordinates or value', () => {
        const data = normalize({
            values: [{ x: 1, y: 1, value: 1 }, { x: 'a', y: 1, value: 1 }, { x: 1, y: NaN, value: 1 }, { x: 1, y: 1 }],
            resolution: 10
        })

        expect(data.values)
            .toHaveLength(1)
    })

    it('Should keep points that share a position', () => {
        const data = normalize({ values: [{ x: 1, y: 1, value: 1 }, { x: 1, y: 1, value: 2 }], resolution: 10 })

        expect(data.values)
            .toHaveLength(2)
    })

    it('Should not make labels for points', () => {
        const data = normalize({ values: [{ x: 1, y: 1, value: 1 }], resolution: 10 })

        expect(data.xLabels)
            .toBeUndefined()
    })
})