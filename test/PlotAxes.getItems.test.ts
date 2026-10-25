import { buildItems, createPlot, createSeries, UNITS } from './PlotTestData'
import PlotData from '@/types/data/PlotData'
import RenderItemText from '@/types/RenderItemText'
import RenderItemLine from '@/types/RenderItemLine'
import PlotAxes from '@/render/plot/PlotAxes'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getAxes = (data: Partial<PlotData> = {}) => {
    const plot = createPlot([createSeries(PlotType.Line, [10, 40])], data)

    return buildItems(new PlotAxes(plot.data, UNITS, plot.layout, plot.seriesGroups).getItems())
}

describe('Getting plot axes', () => {
    it('Should draw labels before lines', () => {
        const items = getAxes()
        const firstLine = items.findIndex(item => item.shape instanceof RenderItemLine)

        expect(firstLine)
            .toBeGreaterThan(0)
        expect(items.slice(0, firstLine).every(item => item.shape instanceof RenderItemText))
            .toBe(true)
        expect(items.slice(firstLine).every(item => item.shape instanceof RenderItemLine))
            .toBe(true)
    })

    it('Should draw nothing for simple chart', () => {
        expect(getAxes({ simple: true }))
            .toEqual([])
    })
})