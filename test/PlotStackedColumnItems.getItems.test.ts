import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import PlotStackedColumnItems from '@/render/plot/PlotStackedColumnItems'
import { getColumnGroups } from '@/render/plot/PlotColumnGroups'
import { PlotScaleType, PlotType } from '@/static/Enums'

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
            .toBe(baseline - valueScale.getCoordinate(10))
        expect(top.y)
            .toBe(baseline - bottom.height)
        expect(top.height)
            .toBeCloseTo(valueScale.getCoordinate(10) - valueScale.getCoordinate(40))
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
            .toBe(valueScale.getCoordinate(-20))
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
        const { baseline, valueScale } = layout.vertical

        expect(rects[0][0].absolute.height)
            .toBe(baseline - valueScale.getCoordinate(80))
        expect(rects[1][0].absolute.height)
            .toBeCloseTo(valueScale.getCoordinate(80) - valueScale.getCoordinate(100))
    })

    it('Should round last visible part when stack top is clipped by y max', () => {
        const { rects } = getStacks(
            [createSeries(PlotType.StackingColumn, [100]), createSeries(PlotType.StackingColumn, [20])],
            { yMax: 100 }
        )

        expect(rects[0][0].radii)
            .toEqual([80, 80, 0, 0])
        expect(rects[1][0].absolute.height)
            .toBe(0)
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

    it('Should stack from log baseline between stacked values on log scale', () => {
        const { layout, rects } = getStacks(
            [createSeries(PlotType.StackingColumn, [10]), createSeries(PlotType.StackingColumn, [30])],
            { yScale: PlotScaleType.Log }
        )
        const { baseline, valueScale } = layout.vertical
        const [bottom, top] = rects.map(series => series[0].absolute)

        expect([bottom.y, bottom.height])
            .toEqual([baseline, baseline - valueScale.getCoordinate(10)])
        expect(top.y)
            .toBe(valueScale.getCoordinate(10))
        expect(top.height)
            .toBeCloseTo(valueScale.getCoordinate(10) - valueScale.getCoordinate(40))
    })

    it('Should skip stack parts that are not positive on log scale', () => {
        const { rects } = getStacks(
            [createSeries(PlotType.StackingColumn, [10]), createSeries(PlotType.StackingColumn, [-5])],
            { yScale: PlotScaleType.Log }
        )

        expect(rects.map(series => series.length))
            .toEqual([1, 0])
    })

    it('Should collapse disabled stack part on log scale', () => {
        const disabled = createSeries(PlotType.StackingColumn, [10], { disabled: true })
        const { rects } = getStacks(
            [disabled, createSeries(PlotType.StackingColumn, [10])],
            { yScale: PlotScaleType.Log }
        )

        expect(rects[0][0].absolute.height)
            .toBe(0)
    })
})