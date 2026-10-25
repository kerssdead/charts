import { ColumnGroup, getColumnGroup } from '@/render/plot/PlotColumnGroups'
import PlotSeries from '@/types/PlotSeries'

const column = {} as PlotSeries

const groups = new Map<string, ColumnGroup>([
    ['a', { columns: [column, column], hasStacking: false }],
    ['b', { columns: [column], hasStacking: true }]
])

describe('Getting plot column group', () => {
    it('Should give each column its own slot part', () => {
        expect(getColumnGroup(groups, { x: 'a', y: 1 }))
            .toEqual({ columns: [column, column], slots: 2 })
    })

    it('Should add one slot part for all stacking columns', () => {
        expect(getColumnGroup(groups, { x: 'b', y: 1 }).slots)
            .toBe(2)
    })

    it('Should use one slot part for unknown x', () => {
        expect(getColumnGroup(groups, { x: 'z', y: 1 }))
            .toEqual({ columns: [], slots: 1 })
    })
})