import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import RenderItemLine from '@/types/RenderItemLine'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotAxisLines from '@/render/plot/PlotAxisLines'
import { Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getLines = (all: PlotSeries[]) => {
    const plot = createPlot(all)
    const lines = new PlotAxisLines(plot.layout, plot.seriesGroups)
    const items = buildItems((builder: QueueItemsBuilder) => lines.addItems(builder))

    return { ...plot, items, lines: new Map(items.map(item => [item.key!, item])) }
}

describe('Adding plot axis lines', () => {
    it('Should draw y axis at first value and grid at others', () => {
        const { layout, lines } = getLines([createSeries(PlotType.Line, [10, 40])])
        const { valueScale } = layout.vertical
        const [first, ...rest] = valueScale.values
        const y = valueScale.getCoordinate(first)

        expect((lines.get('axis-y')!.shape as RenderItemLine).absolute)
            .toEqual([{ x: layout.margin.left, y }, { x: 5000 - layout.margin.right, y }])
        expect(lines.get('axis-y')!.layer)
            .toBe(Layer.Data + 50)

        for (const value of rest) {
            const grid = lines.get(`grid-y-${ value }`)!

            expect((grid.shape as RenderItemLine).absolute[0].y)
                .toBe(valueScale.getCoordinate(value))
            expect((grid.shape as RenderItemLine).dash)
                .toEqual([1, 20])
            expect(grid.axisValue)
                .toBe(value)
            expect(grid.layer)
                .toBe(Layer.Base)
        }
    })

    it('Should draw vertical bar axis and grid across horizontal section', () => {
        const { layout, lines } = getLines([createSeries(PlotType.Bar, [10, 40])])
        const { band, valueScale } = layout.horizontal
        const x = valueScale.getCoordinate(valueScale.values[1])

        expect((lines.get(`grid-x-${ valueScale.values[1] }`)!.shape as RenderItemLine).absolute)
            .toEqual([{ x, y: band.top }, { x, y: band.bottom }])
        expect(lines.get(`grid-x-${ valueScale.values[1] }`)!.axisValue)
            .toBeNull()
        expect(lines.has('axis-x'))
            .toBe(true)
    })

    it('Should not draw y lines for horizontal chart', () => {
        const { items } = getLines([createSeries(PlotType.Bar, [10, 40])])

        expect(items.some(item => item.key!.startsWith('axis-y') || item.key!.startsWith('grid-y')))
            .toBe(false)
    })

    it('Should draw axis line even without values', () => {
        const { lines } = getLines([])

        expect(lines.has('axis-y'))
            .toBe(true)
    })
})