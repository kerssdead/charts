import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import PlotStackedColumnItems from '@/render/plot/PlotStackedColumnItems'
import { getColumnGroups } from '@/render/plot/PlotColumnGroups'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getStacks = (all: PlotSeries[], data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const stackedColumns = new PlotStackedColumnItems(
        plot.layout,
        plot.style,
        plot.seriesGroups,
        getColumnGroups(plot.seriesGroups.enabledSeries)
    )
    const stacks = new Map<string, number>()
    const rects = all.filter(series => series.type == PlotType.StackingColumn)
                     .map(series => buildItems(stackedColumns.getItems(series, stacks)).map(item => item.shape as RenderItemRectangle))

    return { ...plot, rects }
}

describe('Getting plot stacked column items', () => {
    it('Should stack next series on top of previous ones', () => {
        const { layout, rects } = getStacks([createSeries(PlotType.StackingColumn, [10]), createSeries(PlotType.StackingColumn, [30])])
        const { baseline, valueScale } = layout.vertical
        const [bottom, top] = rects.map(series => series[0].absolute)

        expect(bottom.y)
            .toBe(baseline)
        expect(bottom.height)
            .toBe(10 * valueScale.lengthPerUnit)
        expect(top.y)
            .toBe(baseline - bottom.height)
        expect(top.height)
            .toBe(30 * valueScale.lengthPerUnit)
    })

    it('Should stack negative values down separately', () => {
        const { layout, rects } = getStacks([
            createSeries(PlotType.StackingColumn, [10]),
            createSeries(PlotType.StackingColumn, [-20]),
            createSeries(PlotType.StackingColumn, [-5])
        ])
        const { baseline, valueScale } = layout.vertical

        expect(rects[1][0].absolute.y)
            .toBe(baseline)
        expect(rects[2][0].absolute.y)
            .toBe(baseline + 20 * valueScale.lengthPerUnit)
    })

    it('Should round only top of stack', () => {
        const { rects } = getStacks([createSeries(PlotType.StackingColumn, [10]), createSeries(PlotType.StackingColumn, [30])])

        expect(rects[0][0].radii)
            .toEqual([0, 0, 0, 0])
        expect(rects[1][0].radii)
            .toEqual([80, 80, 0, 0])
    })

    it('Should limit stack height to y max', () => {
        const { layout, rects } = getStacks(
            [createSeries(PlotType.StackingColumn, [80]), createSeries(PlotType.StackingColumn, [80])],
            { yMax: 100 }
        )
        const { lengthPerUnit } = layout.vertical.valueScale

        expect(rects[0][0].absolute.height)
            .toBe(80 * lengthPerUnit)
        expect(rects[1][0].absolute.height)
            .toBeCloseTo(20 * lengthPerUnit)
    })

    it('Should place stack after regular columns in slot', () => {
        const { layout, rects } = getStacks([createSeries(PlotType.Column, [10]), createSeries(PlotType.StackingColumn, [10])])
        const { categoryScale } = layout.vertical

        expect(rects[0][0].absolute)
            .toMatchObject({ x: categoryScale.getSlotStart(0) + categoryScale.step / 2, width: categoryScale.step / 2 })
    })

    it('Should collapse disabled stack part', () => {
        const disabled = createSeries(PlotType.StackingColumn, [10], { disabled: true })
        const { rects } = getStacks([createSeries(PlotType.StackingColumn, [10]), disabled])

        expect(rects[1][0].absolute.height)
            .toBe(0)
    })
})