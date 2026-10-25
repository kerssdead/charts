import PlotLabelSpacing from '@/render/plot/PlotLabelSpacing'
import Units from '@/helpers/Units'
import { short } from '@/helpers/Text'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const spacing = new PlotLabelSpacing(new Units({ x: 1, y: 1 }), 0)

const VALUES = [1000, 2000, 3000]

describe('Getting plot value labels', () => {
    it('Should use full labels when they fit', () => {
        expect(spacing.getValueLabels(VALUES, [100, 300, 500], false))
            .toEqual(VALUES.map(value => short(value, false)))
    })

    it('Should use short labels when full labels overlap', () => {
        expect(spacing.getValueLabels(VALUES, [100, 125, 150], false))
            .toEqual(VALUES.map(value => short(value, true)))
    })

    it('Should use short labels when requested', () => {
        expect(spacing.getValueLabels(VALUES, [100, 300, 500], true))
            .toEqual(VALUES.map(value => short(value, true)))
    })

    it('Should hide overlapping labels', () => {
        const labels = spacing.getValueLabels(VALUES, [100, 100, 100], false)

        expect(labels.filter(label => label).length)
            .toBe(1)
        expect(labels.slice(1))
            .toEqual(['', ''])
    })
})