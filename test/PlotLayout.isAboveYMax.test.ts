import { createPlot } from './PlotTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Checking plot value is above y max', () => {
    it('Should be above only when greater than y max', () => {
        const { layout } = createPlot([], { yMax: 100 })

        expect([150, 100, -50].map(y => layout.isAboveYMax(y)))
            .toEqual([true, false, false])
    })

    it('Should never be above without y max', () => {
        expect(createPlot([]).layout.isAboveYMax(150))
            .toBe(false)
    })
})