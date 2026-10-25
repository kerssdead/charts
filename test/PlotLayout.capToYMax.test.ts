import { createPlot } from './PlotTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Capping plot value to y max', () => {
    it('Should cap values above y max', () => {
        expect(createPlot([], { yMax: 100 }).layout.capToYMax(150))
            .toBe(100)
    })

    it('Should keep values below y max', () => {
        expect(createPlot([], { yMax: 100 }).layout.capToYMax(-50))
            .toBe(-50)
    })

    it('Should keep values without y max', () => {
        expect(createPlot([]).layout.capToYMax(150))
            .toBe(150)
    })
})