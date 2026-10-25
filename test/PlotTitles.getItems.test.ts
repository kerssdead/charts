import { buildItems, createPlot, createSeries, UNITS } from './PlotTestData'
import PlotData from '@/types/data/PlotData'
import RenderItemText from '@/types/RenderItemText'
import PlotTitles from '@/render/plot/PlotTitles'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const getTitles = (data: Partial<PlotData>, type = PlotType.Line) => {
    const plot = createPlot([createSeries(type, [1, 2])], data)

    return buildItems(new PlotTitles(plot.data, UNITS, plot.layout).getItems())
}

describe('Getting plot titles', () => {
    it('Should draw rotated left title at middle height', () => {
        const [title] = getTitles({ yTitle: 'Orders' })
        const text = title.shape as RenderItemText

        expect(title.key)
            .toBe('axis-title-x')
        expect(text.value)
            .toBe('Orders')
        expect(text.absolute)
            .toEqual({ x: 12, y: 2500 })
        expect(text.rotate)
            .toBe(Math.PI * 1.5)
    })

    it('Should draw bottom title at center', () => {
        const [title] = getTitles({ xTitle: 'Days' })
        const text = title.shape as RenderItemText

        expect(title.key)
            .toBe('axis-title-y')
        expect(text.value)
            .toBe('Days')
        expect(text.absolute)
            .toEqual({ x: 2500, y: 5000 - 13 })
    })

    it('Should swap titles for horizontal chart', () => {
        const titles = getTitles({ xTitle: 'Days', yTitle: 'Orders' }, PlotType.Bar)

        expect(titles.map(title => (title.shape as RenderItemText).value))
            .toEqual(['Days', 'Orders'])
    })

    it('Should draw nothing without titles', () => {
        expect(getTitles({}))
            .toEqual([])
    })

    it('Should draw nothing for simple chart', () => {
        expect(getTitles({ simple: true, xTitle: 'Days', yTitle: 'Orders' }))
            .toEqual([])
    })
})