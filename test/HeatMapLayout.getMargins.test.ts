import { getMargins } from '@/render/heatMap/HeatMapLayout'
import {
    AXIS_LABEL_HEIGHT,
    LABEL_GAP,
    PADDING,
    SCALE_HEIGHT,
    TITLE_FONT
} from '@/render/heatMap/HeatMapConstants'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const BASE_BOTTOM = PADDING + SCALE_HEIGHT + LABEL_GAP

describe('Getting margins', () => {
    it('Should leave room for the scale without axes', () => {
        expect(getMargins(null))
            .toEqual({ left: PADDING, top: PADDING, right: PADDING, bottom: BASE_BOTTOM })
    })

    it('Should leave room for the widest vertical label', () => {
        expect(getMargins({ yLabels: ['a', 'abcd', 'ab'], font: 10 }).left)
            .toBe(PADDING + 20 + LABEL_GAP)
    })

    it('Should leave room for the horizontal labels', () => {
        expect(getMargins({ yLabels: ['a'], font: 10 }).bottom)
            .toBe(BASE_BOTTOM + Math.ceil(AXIS_LABEL_HEIGHT) + LABEL_GAP)
    })

    it('Should add room for the vertical title on the left', () => {
        const plain = getMargins({ yLabels: ['a'], font: 10 })
        const titled = getMargins({ yLabels: ['a'], font: 10, yTitle: 'Hour' })

        expect(titled.left - plain.left)
            .toBe(TITLE_FONT + LABEL_GAP)
        expect(titled.bottom)
            .toBe(plain.bottom)
    })

    it('Should add room for the horizontal title at the bottom', () => {
        const plain = getMargins({ yLabels: ['a'], font: 10 })
        const titled = getMargins({ yLabels: ['a'], font: 10, xTitle: 'Day' })

        expect(titled.bottom - plain.bottom)
            .toBe(TITLE_FONT + LABEL_GAP)
        expect(titled.left)
            .toBe(plain.left)
    })
})