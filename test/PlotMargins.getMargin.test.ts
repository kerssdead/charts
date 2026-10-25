import { getMargin } from '@/render/plot/PlotMargins'
import Units from '@/helpers/Units'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 1, y: 1 })

describe('Getting plot margin', () => {
    it('Should use fixed margin for simple chart', () => {
        expect(getMargin(UNITS, true, 'Left', 'Bottom', ['100']))
            .toEqual({ top: 50, right: 50, bottom: 50, left: 50 })
    })

    it('Should fit widest left label and left title', () => {
        expect(getMargin(UNITS, false, 'Left', '', ['5', '100']).left)
            .toBe(8 + 14 + 8 + 21 + 8)
    })

    it('Should skip left title space without left title', () => {
        expect(getMargin(UNITS, false, '', '', ['100']).left)
            .toBe(8 + 21 + 8)
    })

    it('Should fit bottom labels and bottom title', () => {
        expect(getMargin(UNITS, false, '', 'Bottom', []).bottom)
            .toBeCloseTo(15.6 + 6 + 14 + 6)
        expect(getMargin(UNITS, false, '', '', []).bottom)
            .toBeCloseTo(15.6 + 6)
    })

    it('Should keep fixed top and right margins', () => {
        const margin = getMargin(UNITS, false, '', '', [])

        expect(margin.top)
            .toBe(200)
        expect(margin.right)
            .toBe(100)
    })

    it('Should convert pixels to units', () => {
        const margin = getMargin(new Units({ x: 2, y: 3 }), false, '', '', ['100'])

        expect(margin.left)
            .toBe((8 + 21 + 8) * 2)
        expect(margin.bottom)
            .toBeCloseTo((15.6 + 6) * 3)
    })
})