import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemLine from '@/types/RenderItemLine'
import PlotLineItems from '@/render/plot/PlotLineItems'
import { PlotAxisType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getLine = (all: PlotSeries[], series: PlotSeries, data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const lines = new PlotLineItems(plot.layout, plot.style)

    return { ...plot, line: buildItems(lines.getItems(series))[0].shape as RenderItemLine }
}

describe('Getting plot line items', () => {
    it('Should put line stops at slot centers and values', () => {
        const series = createSeries(PlotType.Line, [10, 40])
        const { layout, line } = getLine([series], series)
        const { baseline, categoryScale, valueScale } = layout.vertical

        expect(line.absolute)
            .toEqual([
                { x: categoryScale.getSlotCenter(0), y: baseline - 10 * valueScale.lengthPerUnit },
                { x: categoryScale.getSlotCenter(1), y: baseline - 40 * valueScale.lengthPerUnit }
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
            .toBe(baseline - 100 * valueScale.lengthPerUnit)
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
})