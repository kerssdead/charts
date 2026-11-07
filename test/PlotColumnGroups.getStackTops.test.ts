import { getStackTops } from '@/render/plot/PlotColumnGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

const series = (type: PlotType, ...ys: (number | null)[]) => {
    return { type, values: ys.map((y, i) => ({ x: i, y })) } as PlotSeries
}

describe('Getting plot stack tops', () => {
    it('Should take last stacking series with non-zero value', () => {
        const bottom = series(PlotType.StackingColumn, 1, 1)
        const top = series(PlotType.StackingColumn, 1, 0)
        const tops = getStackTops([bottom, top])

        expect(tops.get('0+'))
            .toBe(top)
        expect(tops.get('1+'))
            .toBe(bottom)
    })

    it('Should track positive and negative stacks separately', () => {
        const positive = series(PlotType.StackingColumn, 1)
        const negative = series(PlotType.StackingColumn, -1)
        const tops = getStackTops([positive, negative])

        expect(tops.get('0+'))
            .toBe(positive)
        expect(tops.get('0-'))
            .toBe(negative)
    })

    it('Should skip series starting at or above y max', () => {
        const bottom = series(PlotType.StackingColumn, 4, 3)
        const top = series(PlotType.StackingColumn, 1, 2)
        const tops = getStackTops([bottom, top], 4)

        expect(tops.get('0+'))
            .toBe(bottom)
        expect(tops.get('1+'))
            .toBe(top)
    })

    it('Should ignore other series types', () => {
        expect(getStackTops([series(PlotType.Column, 1)]).size)
            .toBe(0)
    })

    it('Should skip missing values', () => {
        const bottom = series(PlotType.StackingColumn, 1)
        const top = series(PlotType.StackingColumn, null)

        expect(getStackTops([bottom, top]).get('0+'))
            .toBe(bottom)
    })
})