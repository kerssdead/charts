import PlotLabelSpacing from '@/render/plot/PlotLabelSpacing'
import Units from '@/helpers/Units'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const spacing = new PlotLabelSpacing(new Units({ x: 1, y: 1 }), 100)

describe('Clamping plot label', () => {
    it('Should keep label position inside bounds', () => {
        expect(spacing.clampLabel('abcd', 500))
            .toBe(500)
    })

    it('Should keep label right of left boundary', () => {
        expect(spacing.clampLabel('abcd', 0))
            .toBe(112)
    })

    it('Should keep label left of canvas edge', () => {
        expect(spacing.clampLabel('abcd', 5000))
            .toBe(4988)
    })
})