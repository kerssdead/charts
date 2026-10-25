import { getLabelSpace } from '@/render/segmentedBar/SegmentedBarLayout'
import Units from '@/helpers/Units'
import { COORDS_MAX_X } from '@/static/constants/Index'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string, font: number = 14) => text.length * font / 2 }))

const UNITS = new Units({ x: 5, y: 125 })

describe('Getting segmented bar label space', () => {
    it('Should take no space without text', () => {
        expect(getLabelSpace(UNITS, undefined))
            .toBe(0)
        expect(getLabelSpace(UNITS, ''))
            .toBe(0)
    })

    it('Should take text width with gap', () => {
        expect(getLabelSpace(UNITS, 'Lore'))
            .toBe(UNITS.x(24 + 12))
    })

    it('Should limit text width to share of canvas', () => {
        expect(getLabelSpace(UNITS, 'L'.repeat(200)))
            .toBe(COORDS_MAX_X * .2 + UNITS.x(12))
    })
})