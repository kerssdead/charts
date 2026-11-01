import { createPlot, createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

const TITLES = { xTitle: 'X', yTitle: 'Y' }

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot left title', () => {
    it('Should show y title for vertical chart', () => {
        expect(createPlot([createSeries(PlotType.Line, [1])], TITLES).layout.leftTitle)
            .toBe('Y')
    })

    it('Should show x title for horizontal chart', () => {
        expect(createPlot([createSeries(PlotType.Bar, [1])], TITLES).layout.leftTitle)
            .toBe('X')
    })

    it('Should show x title when mixed chart renders only bars', () => {
        const values = [createSeries(PlotType.Bar, [1]), createSeries(PlotType.Line, [1], { disabled: true })]

        expect(createPlot(values, TITLES).layout.leftTitle)
            .toBe('X')
    })

    it('Should show y title when mixed chart renders no bars', () => {
        const values = [createSeries(PlotType.Bar, [1], { disabled: true }), createSeries(PlotType.Line, [1])]

        expect(createPlot(values, TITLES).layout.leftTitle)
            .toBe('Y')
    })
})