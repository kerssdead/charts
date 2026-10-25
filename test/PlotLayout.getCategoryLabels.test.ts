import { createPlot, createSeries } from './PlotTestData'
import { PlotAxisType, PlotType } from '@/static/Enums'

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
})