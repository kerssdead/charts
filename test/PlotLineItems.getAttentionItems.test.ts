import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemLine from '@/types/RenderItemLine'
import PlotLineItems from '@/render/plot/PlotLineItems'
import { PlotScaleType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getAttention = (all: PlotSeries[], series: PlotSeries, data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const lines = new PlotLineItems(plot.layout, plot.style)

    return { ...plot, items: buildItems(lines.getAttentionItems(series)) }
}

describe('Getting plot attention line items', () => {
    it('Should draw horizontal line across plot at first value', () => {
        const attention = createSeries(PlotType.AttentionLine, [30])
        const { layout, items } = getAttention([createSeries(PlotType.Line, [10, 50]), attention], attention)
        const { valueScale } = layout.vertical
        const y = valueScale.getCoordinate(30)

        expect((items[0].shape as RenderItemLine).absolute)
            .toEqual([{ x: layout.margin.left, y }, { x: 5000 - layout.margin.right, y }])
        expect(items[0].key)
            .toBe('1-attention')
    })

    it('Should not cap line by y max', () => {
        const attention = createSeries(PlotType.AttentionLine, [300])
        const { layout, items } = getAttention([createSeries(PlotType.Line, [10, 50]), attention], attention, { yMax: 100 })
        const { valueScale } = layout.vertical

        expect((items[0].shape as RenderItemLine).absolute[0].y)
            .toBe(valueScale.getCoordinate(300))
    })

    it('Should draw nothing when first value is missing', () => {
        const attention = createSeries(PlotType.AttentionLine, [null])

        expect(getAttention([createSeries(PlotType.Line, [10, 50]), attention], attention).items)
            .toEqual([])
    })

    it('Should draw nothing without values', () => {
        const attention = createSeries(PlotType.AttentionLine, [])

        expect(getAttention([attention], attention).items)
            .toEqual([])
    })

    it('Should clip line to plot', () => {
        const attention = createSeries(PlotType.AttentionLine, [30])
        const { layout, items } = getAttention([createSeries(PlotType.Line, [10, 50]), attention], attention)
        const { top, bottom } = layout.vertical.band

        expect((items[0].shape as RenderItemLine).clip)
            .toEqual({
                x: layout.margin.left,
                y: top,
                width: 5000 - layout.margin.left - layout.margin.right,
                height: bottom - top
            })
    })

    it('Should draw nothing for value that is not positive on log scale', () => {
        const attention = createSeries(PlotType.AttentionLine, [0])
        const line = createSeries(PlotType.Line, [10, 50])

        expect(getAttention([line, attention], attention, { yScale: PlotScaleType.Log }).items)
            .toEqual([])
    })
})