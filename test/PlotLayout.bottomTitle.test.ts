import { createPlot, createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

const TITLES = { xTitle: 'X', yTitle: 'Y' }

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot bottom title', () => {
    it('Should show x title for vertical chart', () => {
        expect(createPlot([createSeries(PlotType.Line, [1])], TITLES).layout.bottomTitle)
            .toBe('X')
    })

    it('Should show y title for horizontal chart', () => {
        expect(createPlot([createSeries(PlotType.Bar, [1])], TITLES).layout.bottomTitle)
            .toBe('Y')
    })
})