import { createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import { getStackOutlines } from '@/render/plot/PlotStackOutlines'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const stack = (...ys: number[]) => {
    return ys.map((y, i) => createSeries(PlotType.StackingColumn, [y], { id: `s${ i }` }))
}

const getOutline = (all: PlotSeries[], data: Partial<PlotData> = {}, key: string = 'C0+') => {
    const { layout, seriesGroups } = createPlot(all, data)

    return { layout, outline: getStackOutlines(layout, seriesGroups.enabledSeries).get(key) }
}

describe('Getting stack outlines', () => {
    it('Should end the outline at the capped stack total', () => {
        const { layout, outline } = getOutline(stack(60, 60), { yMax: 100 })

        expect(outline?.far)
            .toBe(layout.vertical.valueScale.getCoordinate(100))
    })

    it('Should clip a stack whose capped top segment is thinner than the corner radius', () => {
        expect(getOutline(stack(99, 10), { yMax: 100 }).outline?.needsClip)
            .toBe(true)
    })

    it('Should clip a stack whose top segment is tiny without any y max', () => {
        expect(getOutline(stack(1000, 1)).outline?.needsClip)
            .toBe(true)
    })

    it('Should not clip a stack whose top segment is tall enough', () => {
        expect(getOutline(stack(40, 60), { yMax: 100 }).outline?.needsClip)
            .toBe(false)
    })

    it('Should not clip a stack with a single segment', () => {
        expect(getOutline(stack(1000, 0)).outline?.needsClip)
            .toBe(false)
    })

    it('Should ignore segments that start above y max when finding the top segment', () => {
        expect(getOutline(stack(300, 5), { yMax: 100 }).outline?.needsClip)
            .toBe(false)
    })

    it('Should clip negative stacks with a thin last segment', () => {
        const { layout, outline } = getOutline(stack(-1000, -1), {}, 'C0-')

        expect([outline?.needsClip, (outline?.far ?? 0) > layout.vertical.baseline])
            .toEqual([true, true])
    })

    it('Should keep positive and negative stacks of one category apart', () => {
        const all = [
            createSeries(PlotType.StackingColumn, [100], { id: 'a' }),
            createSeries(PlotType.StackingColumn, [-100], { id: 'b' })
        ]
        const { layout, seriesGroups } = createPlot(all)

        expect([...getStackOutlines(layout, seriesGroups.enabledSeries).keys()].sort())
            .toEqual(['C0+', 'C0-'])
    })

    it('Should skip other series types and missing values', () => {
        const all = [createSeries(PlotType.Column, [5]), createSeries(PlotType.StackingColumn, [null])]
        const { layout, seriesGroups } = createPlot(all)

        expect(getStackOutlines(layout, seriesGroups.enabledSeries).size)
            .toBe(0)
    })
})
