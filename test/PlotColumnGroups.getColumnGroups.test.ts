import { getColumnGroups } from '@/render/plot/PlotColumnGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

const series = (type: PlotType, ...xs: string[]) =>
    ({ type, values: xs.map(x => ({ x, y: 1 })) }) as PlotSeries

describe('Getting plot column groups', () => {
    it('Should collect columns per x', () => {
        const first = series(PlotType.Column, 'a', 'b')
        const second = series(PlotType.Column, 'a')
        const groups = getColumnGroups([first, second])

        expect(groups.get('a'))
            .toEqual({ columns: [first, second], hasStacking: false })
        expect(groups.get('b'))
            .toEqual({ columns: [first], hasStacking: false })
    })

    it('Should mark x with stacking columns', () => {
        expect(getColumnGroups([series(PlotType.StackingColumn, 'a')]).get('a'))
            .toEqual({ columns: [], hasStacking: true })
    })

    it('Should ignore lines and bars', () => {
        expect(getColumnGroups([series(PlotType.Line, 'a'), series(PlotType.Bar, 'b')]).size)
            .toBe(0)
    })
})