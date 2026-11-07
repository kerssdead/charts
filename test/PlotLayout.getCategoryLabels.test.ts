import { createPlot, createSeries } from './PlotTestData'
import { PlotAxisType, PlotScaleType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot category labels', () => {
    it('Should format slots of section', () => {
        const { layout } = createPlot([createSeries(PlotType.Bar, [1, 2]), createSeries(PlotType.Line, [1])])

        expect(layout.getCategoryLabels(layout.horizontal))
            .toEqual(['C0', 'C1'])
        expect(layout.getCategoryLabels(layout.vertical))
            .toEqual(['C0'])
    })

    it('Should format date slots', () => {
        const values = [{ x: '2025-01-02', y: 1 }]
        const { layout } = createPlot([createSeries(PlotType.Line, [], { values })], { xType: PlotAxisType.Date })

        expect(layout.getCategoryLabels(layout.vertical))
            .toEqual([new Date(2025, 0, 2).toLocaleDateString()])
    })

    it('Should format intraday date ticks of continuous scale with time', () => {
        const values = [10, 13].map(hours => ({ x: new Date(2025, 0, 5, hours), y: 1 }))
        const { layout } = createPlot(
            [createSeries(PlotType.Line, [], { values })],
            { xType: PlotAxisType.Date, xScale: PlotScaleType.Linear }
        )

        expect(layout.getCategoryLabels(layout.vertical).map(label => label.replace(/\s/g, ' ')))
            .toEqual(['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM'])
    })

    it('Should format ticks of continuous scale', () => {
        const values = [0, 10, 40].map(x => ({ x, y: 1 }))
        const { layout } = createPlot(
            [createSeries(PlotType.Line, [], { values })],
            { xType: PlotAxisType.Number, xScale: PlotScaleType.Linear }
        )

        expect(layout.getCategoryLabels(layout.vertical))
            .toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40'])
    })
})