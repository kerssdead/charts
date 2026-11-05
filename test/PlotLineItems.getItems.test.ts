import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemLine from '@/types/RenderItemLine'
import PlotLineItems from '@/render/plot/PlotLineItems'
import { LineDrawMode, PlotAxisType, PlotScaleType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getLine = (all: PlotSeries[], series: PlotSeries, data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const lines = new PlotLineItems(plot.layout, plot.style)

    return { ...plot, line: buildItems(lines.getItems(series))[0].shape as RenderItemLine }
}

const curveCount = (line: RenderItemLine) => {
    const ctx = { moveTo: jest.fn(), lineTo: jest.fn(), bezierCurveTo: jest.fn() }

    line.pathTracer.updateCurve(line.absolute)
    line.pathTracer.trace(ctx as unknown as CanvasRenderingContext2D, line.absolute, line.absolute.length, false)

    return ctx.bezierCurveTo.mock.calls.length
}

describe('Getting plot line items', () => {
    it('Should put line stops at slot centers and values', () => {
        const series = createSeries(PlotType.Line, [10, 40])
        const { layout, line } = getLine([series], series)
        const { baseline, categoryScale, valueScale } = layout.vertical

        expect(line.absolute)
            .toEqual([
                { x: categoryScale.getSlotCenter(0), y: valueScale.getCoordinate(10) },
                { x: categoryScale.getSlotCenter(1), y: valueScale.getCoordinate(40) }
            ])
    })

    it('Should order stops by slot', () => {
        const series = createSeries(PlotType.Line, [], { values: [{ x: 3, y: 30 }, { x: 1, y: 10 }] })
        const { line } = getLine([series], series, { xType: PlotAxisType.Number })

        expect(line.tooltips)
            .toEqual([`${ series.label }: 10`, `${ series.label }: 30`])
    })

    it('Should cap stops by y max', () => {
        const series = createSeries(PlotType.Line, [10, 400])
        const { layout, line } = getLine([series], series, { yMax: 100 })
        const { baseline, valueScale } = layout.vertical

        expect(line.absolute[1].y)
            .toBe(valueScale.getCoordinate(100))
    })

    it('Should use series dash', () => {
        const series = createSeries(PlotType.Line, [1], { dash: [4, 2] })

        expect(getLine([series], series).line.dash)
            .toEqual([4, 2])
    })

    it('Should use solid line without dash', () => {
        const series = createSeries(PlotType.Line, [1], { dash: undefined as unknown as number[] })

        expect(getLine([series], series).line.dash)
            .toEqual([])
    })

    it('Should use series draw mode for line', () => {
        const series = createSeries(PlotType.Line, [1, 2, 3], { drawMode: LineDrawMode.Smooth })

        expect(curveCount(getLine([series], series).line))
            .toBe(2)
    })

    it('Should use series draw mode for area', () => {
        const series = createSeries(PlotType.Area, [1, 2, 3], { drawMode: LineDrawMode.Smooth })

        expect(curveCount(getLine([series], series).line))
            .toBe(2)
    })

    it('Should draw straight without series draw mode', () => {
        const series = createSeries(PlotType.Line, [1, 2, 3])

        expect(curveCount(getLine([series], series).line))
            .toBe(0)
    })

    it('Should give area series a baseline at zero', () => {
        const series = createSeries(PlotType.Area, [10, 40])
        const { layout, line } = getLine([series], series)

        expect(line.areaBaseline)
            .toBe(layout.vertical.baseline)
    })

    it('Should not give line series an area', () => {
        const series = createSeries(PlotType.Line, [10, 40])

        expect(getLine([series], series).line.areaBaseline)
            .toBeNull()
    })

    it('Should clip line to plot', () => {
        const series = createSeries(PlotType.Line, [10, 40])
        const { layout, line } = getLine([series], series)
        const { top, bottom } = layout.vertical.band

        expect(line.clip)
            .toEqual({
                x: layout.margin.left,
                y: top,
                width: 5000 - layout.margin.left - layout.margin.right,
                height: bottom - top
            })
    })

    it('Should clip line to its own band when mixed with bars', () => {
        const series = createSeries(PlotType.Line, [10, 40])
        const { layout, line } = getLine([createSeries(PlotType.Bar, [5, 20]), series], series)
        const { top, bottom } = layout.vertical.band

        expect([line.clip!.y, line.clip!.height, top > layout.margin.top])
            .toEqual([top, bottom - top, true])
    })

    it('Should skip stops that are not positive on log scale', () => {
        const series = createSeries(PlotType.Line, [10, 0, 100])
        const { layout, line } = getLine([series], series, { yScale: PlotScaleType.Log })
        const { categoryScale, valueScale } = layout.vertical

        expect(line.absolute)
            .toEqual([
                { x: categoryScale.getSlotCenter(0), y: valueScale.getCoordinate(10) },
                { x: categoryScale.getSlotCenter(2), y: valueScale.getCoordinate(100) }
            ])
    })
})