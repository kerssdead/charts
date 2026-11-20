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

    it.each([0, '', null, undefined, NaN, -5, 'abc'])('Should ignore unusable y max %p', yMax => {
        const { layout } = createPlot([], { yMax: yMax as unknown as number })

        expect([layout.yMax, layout.capToYMax(150), layout.isAboveYMax(150)])
            .toEqual([undefined, 150, false])
    })

    it('Should read numeric y max given as text', () => {
        const { layout } = createPlot([], { yMax: '100' as unknown as number })

        expect([layout.yMax, layout.capToYMax(150)])
            .toEqual([100, 100])
    })
})