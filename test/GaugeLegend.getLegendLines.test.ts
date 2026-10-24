import { getLegendLines, LegendItem } from '@/render/gauge/GaugeLegend'

const item = (key: string, width: number): LegendItem => ({ key, text: key, color: '#ff0000', width })

describe('Getting gauge legend lines', () => {
    it('Should wrap items that do not fit available width', () => {
        const items = [item('a', 40), item('b', 40), item('c', 40)]

        expect(getLegendLines(items, 100).map(line => line.map(legendItem => legendItem.key)))
            .toEqual([['a', 'b'], ['c']])
    })

    it('Should keep items that fit exactly in one line', () => {
        expect(getLegendLines([item('a', 42), item('b', 42)], 100).length)
            .toBe(1)
    })

    it('Should put too wide item on its own line', () => {
        expect(getLegendLines([item('a', 150), item('b', 10)], 100).map(line => line.length))
            .toEqual([1, 1])
    })

    it('Should return no lines for no items', () => {
        expect(getLegendLines([], 100))
            .toEqual([])
    })
})