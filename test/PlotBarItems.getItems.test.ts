import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import PlotBarItems from '@/render/plot/PlotBarItems'
import { PlotScaleType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getBars = (all: PlotSeries[], series: PlotSeries, data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const bars = new PlotBarItems(plot.layout, plot.style, plot.seriesGroups)

    return { ...plot, rects: buildItems(bars.getItems(series)).map(item => item.shape as RenderItemRectangle) }
}

describe('Getting plot bar items', () => {
    it('Should grow bars from baseline by value', () => {
        const series = createSeries(PlotType.Bar, [10, 40])
        const { layout, rects } = getBars([series], series)
        const { baseline, valueScale } = layout.horizontal

        rects.forEach((rect, i) => {
            expect(rect.absolute.x)
                .toBe(baseline)
            expect(rect.absolute.width)
                .toBe(valueScale.getCoordinate(series.values[i].y as number) - baseline)
        })
    })

    it('Should fill whole slot with single bar', () => {
        const series = createSeries(PlotType.Bar, [10, 40])
        const { layout, rects } = getBars([series], series)
        const { categoryScale } = layout.horizontal

        expect(rects[1].absolute)
            .toMatchObject({ y: categoryScale.getSlotStart(1), height: categoryScale.step })
    })

    it('Should place bars of several series one above another', () => {
        const first = createSeries(PlotType.Bar, [10])
        const second = createSeries(PlotType.Bar, [20])
        const { layout } = getBars([first, second], first)
        const { categoryScale } = layout.horizontal
        const height = categoryScale.step / 2

        expect(getBars([first, second], first).rects[0].absolute)
            .toMatchObject({ y: categoryScale.getSlotStart(0), height })
        expect(getBars([first, second], second).rects[0].absolute)
            .toMatchObject({ y: categoryScale.getSlotStart(0) - height, height })
    })

    it('Should give disabled bar space to other bars', () => {
        const disabled = createSeries(PlotType.Bar, [10], { disabled: true })
        const enabled = createSeries(PlotType.Bar, [20])
        const { layout, rects } = getBars([disabled, enabled], enabled)

        expect(rects[0].absolute.height)
            .toBe(layout.horizontal.categoryScale.step)
        expect(getBars([disabled, enabled], disabled).rects[0].absolute)
            .toMatchObject({ width: 0, height: 0 })
    })

    it('Should not cap bars by y max after disabling all other series', () => {
        const bar = createSeries(PlotType.Bar, [10, 400])
        const { layout, rects } = getBars([bar, createSeries(PlotType.Line, [1], { disabled: true })], bar, { yMax: 100 })

        expect(rects[1].absolute.width)
            .toBe(layout.horizontal.valueScale.getCoordinate(400) - layout.horizontal.baseline)
    })

    it('Should cap bars by y max only when all series are bars', () => {
        const bar = createSeries(PlotType.Bar, [10, 400])
        const horizontal = getBars([bar], bar, { yMax: 100 })
        const mixed = getBars([bar, createSeries(PlotType.Line, [1])], bar, { yMax: 100 })

        expect(horizontal.rects[1].absolute.width)
            .toBe(horizontal.layout.horizontal.valueScale.getCoordinate(100) - horizontal.layout.horizontal.baseline)
        expect(mixed.rects[1].absolute.width)
            .toBe(mixed.layout.horizontal.valueScale.getCoordinate(400) - mixed.layout.horizontal.baseline)
    })

    it('Should skip bars that are not positive on log scale', () => {
        const series = createSeries(PlotType.Bar, [10, -5, 100])
        const { layout, rects } = getBars([series], series, { yScale: PlotScaleType.Log })
        const { baseline, valueScale } = layout.horizontal

        expect(rects.map(rect => rect.absolute.width))
            .toEqual([valueScale.getCoordinate(10) - baseline, valueScale.getCoordinate(100) - baseline])
    })
})