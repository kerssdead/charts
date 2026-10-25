import { buildItems, createPlot, createSeries, UNITS } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import RenderItemText from '@/types/RenderItemText'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotAxisLabels from '@/render/plot/PlotAxisLabels'
import { PlotType, TextAlignment } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getLabels = (all: PlotSeries[]) => {
    const plot = createPlot(all)
    const labels = new PlotAxisLabels(plot.data, UNITS, plot.layout, plot.seriesGroups)
    const items = buildItems((builder: QueueItemsBuilder) => labels.addItems(builder))

    return { ...plot, items, texts: new Map(items.map(item => [item.key!, item.shape as RenderItemText])) }
}

const keysOf = (items: { key: string | null }[], prefix: string) =>
    items.map(item => item.key!).filter(key => key.startsWith(prefix))

describe('Adding plot axis labels', () => {
    it('Should put y value labels left of plot at their values', () => {
        const { layout, items, texts } = getLabels([createSeries(PlotType.Line, [10, 40])])
        const { valueScale } = layout.vertical

        for (const value of valueScale.values) {
            const label = texts.get(`y-label-${ value }`)!

            expect(label.absolute)
                .toEqual({ x: layout.margin.left - 8, y: valueScale.getCoordinate(value) })
            expect(label.alignment)
                .toBe(TextAlignment.Right)
        }

        expect(items.filter(item => item.key!.startsWith('y-label')).map(item => item.axisValue))
            .toEqual(valueScale.values)
    })

    it('Should put x category labels below vertical section at slot centers', () => {
        const { layout, texts } = getLabels([createSeries(PlotType.Column, [10, 40, 20])])
        const { band, categoryScale } = layout.vertical

        expect(texts.get('x-category-1')!.absolute)
            .toEqual({ x: categoryScale.getSlotCenter(1), y: band.bottom + 4 })
        expect(texts.get('x-category-1')!.value)
            .toBe('C1')
    })

    it('Should skip crowded x category labels', () => {
        const { items } = getLabels([createSeries(PlotType.Line, Array(400).fill(1))])
        const keys = keysOf(items, 'x-category-')

        expect(keys.length)
            .toBeLessThan(400)
        expect(keys[0])
            .toBe('x-category-0')
    })

    it('Should put bar value labels below horizontal section and categories at slot centers', () => {
        const { layout, items, texts } = getLabels([createSeries(PlotType.Bar, [10, 40])])
        const { band, categoryScale, valueScale } = layout.horizontal

        expect(keysOf(items, 'x-label-').length)
            .toBeGreaterThan(0)
        expect(texts.get(`x-label-${ valueScale.values[1] }`)!.absolute.y)
            .toBe(band.bottom + 4)
        expect(texts.get('y-category-1')!.absolute)
            .toEqual({ x: layout.margin.left - 8, y: categoryScale.getSlotCenter(1) })
    })

    it('Should not add vertical labels to horizontal chart', () => {
        const { items } = getLabels([createSeries(PlotType.Bar, [10, 40])])

        expect(keysOf(items, 'y-label-').concat(keysOf(items, 'x-category-')))
            .toEqual([])
    })

    it('Should add both label sets to mixed chart', () => {
        const { items } = getLabels([createSeries(PlotType.Bar, [10, 40]), createSeries(PlotType.Line, [5, 15])])

        expect(keysOf(items, 'y-category-').length)
            .toBe(2)
        expect(keysOf(items, 'x-category-').length)
            .toBe(2)
    })
})