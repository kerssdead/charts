import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import PlotData from '@/types/data/PlotData'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import PlotColumnItems from '@/render/plot/PlotColumnItems'
import { getColumnGroups } from '@/render/plot/PlotColumnGroups'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getColumns = (all: PlotSeries[], series: PlotSeries, data: Partial<PlotData> = {}) => {
    const plot = createPlot(all, data)
    const columns = new PlotColumnItems(
        plot.layout,
        plot.style,
        plot.seriesGroups,
        getColumnGroups(plot.seriesGroups.enabledSeries)
    )

    return { ...plot, rects: buildItems(columns.getItems(series)).map(item => item.shape as RenderItemRectangle) }
}

describe('Getting plot column items', () => {
    it('Should grow columns from baseline by value', () => {
        const series = createSeries(PlotType.Column, [10, 40])
        const { layout, rects } = getColumns([series], series)
        const { baseline, valueScale } = layout.vertical

        rects.forEach((rect, i) => {
            expect(rect.absolute.y)
                .toBe(baseline)
            expect(rect.absolute.height)
                .toBe(series.values[i].y as number * valueScale.lengthPerUnit)
        })
    })

    it('Should fill whole slot with single column', () => {
        const series = createSeries(PlotType.Column, [10, 40])
        const { layout, rects } = getColumns([series], series)
        const { categoryScale } = layout.vertical

        expect(rects[1].absolute.width)
            .toBe(categoryScale.step)
        expect(rects[1].absolute.x)
            .toBe(categoryScale.getSlotCenter(1))
    })

    it('Should place columns of several series side by side', () => {
        const first = createSeries(PlotType.Column, [10])
        const second = createSeries(PlotType.Column, [20])
        const { layout } = getColumns([first, second], first)
        const { categoryScale } = layout.vertical
        const width = categoryScale.step / 2
        const start = categoryScale.getSlotStart(0)

        expect(getColumns([first, second], first).rects[0].absolute)
            .toMatchObject({ x: start + width / 2, width })
        expect(getColumns([first, second], second).rects[0].absolute)
            .toMatchObject({ x: start + width * 1.5, width })
    })

    it('Should cap column by y max', () => {
        const series = createSeries(PlotType.Column, [10, 400])
        const { layout, rects } = getColumns([series], series, { yMax: 100 })

        expect(rects[1].absolute.height)
            .toBe(100 * layout.vertical.valueScale.lengthPerUnit)
    })

    it('Should collapse disabled column', () => {
        const series = createSeries(PlotType.Column, [10], { disabled: true })

        expect(getColumns([series, createSeries(PlotType.Line, [5])], series).rects[0].absolute)
            .toMatchObject({ width: 0, height: 0 })
    })
})