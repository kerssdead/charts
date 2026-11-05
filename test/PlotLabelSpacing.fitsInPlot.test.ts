import PlotLabelSpacing from '@/render/plot/PlotLabelSpacing'
import Units from '@/helpers/Units'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const spacing = new PlotLabelSpacing(new Units({ x: 1, y: 1 }), 100, 4900)

describe('Checking plot label fits in plot', () => {
    it('Should fit label inside plot', () => {
        expect(spacing.fitsInPlot('abcd', 500))
            .toBe(true)
    })

    it('Should fit label touching plot edges', () => {
        expect(spacing.fitsInPlot('abcd', 112))
            .toBe(true)
        expect(spacing.fitsInPlot('abcd', 4888))
            .toBe(true)
    })

    it('Should not fit label crossing left boundary', () => {
        expect(spacing.fitsInPlot('abcd', 111))
            .toBe(false)
    })

    it('Should not fit label crossing plot right edge', () => {
        expect(spacing.fitsInPlot('abcd', 4889))
            .toBe(false)
    })
})