import { createPlot } from './PlotTestData'
import { PlotAxisType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Formatting plot x value', () => {
    it('Should format dates for date axis', () => {
        expect(createPlot([], { xType: PlotAxisType.Date }).layout.formatX('2025-01-02'))
            .toBe(new Date(2025, 0, 2).toLocaleDateString())
    })

    it('Should keep text for other axes', () => {
        expect(createPlot([], { xType: PlotAxisType.Number }).layout.formatX(15))
            .toBe('15')
        expect(createPlot([], { xType: PlotAxisType.Text }).layout.formatX('Day'))
            .toBe('Day')
    })
})