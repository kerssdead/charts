import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemLine from '@/types/RenderItemLine'
import PlotLineItems from '@/render/plot/PlotLineItems'
import { PlotType } from '@/static/Enums'

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
        const { baseline, valueScale } = layout.vertical
        const y = baseline - 30 * valueScale.lengthPerUnit

        expect((items[0].shape as RenderItemLine).absolute)
            .toEqual([{ x: layout.margin.left, y }, { x: 5000 - layout.margin.right, y }])
        expect(items[0].key)
            .toBe('1-attention')
    })

    it('Should cap line by y max', () => {
        const attention = createSeries(PlotType.AttentionLine, [300])
        const { layout, items } = getAttention([createSeries(PlotType.Line, [10, 50]), attention], attention, { yMax: 100 })
        const { baseline, valueScale } = layout.vertical

        expect((items[0].shape as RenderItemLine).absolute[0].y)
            .toBe(baseline - 100 * valueScale.lengthPerUnit)
    })

    it('Should draw nothing without values', () => {
        const attention = createSeries(PlotType.AttentionLine, [])

        expect(getAttention([attention], attention).items)
            .toEqual([])
    })
})