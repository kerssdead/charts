import { createPlot, createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Formatting plot value label', () => {
    it('Should prefix the y max value', () => {
        const { layout } = createPlot([createSeries(PlotType.Column, [400])], { yMax: 100 })

        expect(layout.formatValueLabel(100))
            .toBe('Max 100')
    })

    it('Should keep other values plain', () => {
        const { layout } = createPlot([createSeries(PlotType.Column, [400])], { yMax: 100 })

        expect(layout.formatValueLabel(50))
            .toBe('50')
    })

    it('Should keep values plain without y max', () => {
        const { layout } = createPlot([createSeries(PlotType.Column, [100])])

        expect(layout.formatValueLabel(100))
            .toBe('100')
    })
})
