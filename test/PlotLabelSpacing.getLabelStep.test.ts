import PlotLabelSpacing from '@/render/plot/PlotLabelSpacing'
import Units from '@/helpers/Units'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const spacing = new PlotLabelSpacing(new Units({ x: 1, y: 1 }), 0)

const LABELS = ['aa', 'aa', 'aa', 'aa']

describe('Getting plot label step', () => {
    it('Should show every label when they do not overlap', () => {
        expect(spacing.getLabelStep(LABELS, [100, 200, 300, 400], 1))
            .toBe(1)
    })

    it('Should skip labels until they do not overlap', () => {
        expect(spacing.getLabelStep(LABELS, [100, 110, 120, 130], 1))
            .toBe(2)
    })

    it('Should start from given step', () => {
        expect(spacing.getLabelStep(LABELS, [100, 200, 300, 400], 3))
            .toBe(3)
    })

    it('Should treat step below one as one', () => {
        expect(spacing.getLabelStep(LABELS, [100, 200, 300, 400], 0))
            .toBe(1)
    })

    it('Should not exceed label count', () => {
        expect(spacing.getLabelStep(LABELS, [100, 100, 100, 100], 1))
            .toBe(4)
    })
})