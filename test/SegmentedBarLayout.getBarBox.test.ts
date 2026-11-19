import { getBarBox } from '@/render/segmentedBar/SegmentedBarLayout'
import Units from '@/helpers/Units'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string, font: number = 14) => text.length * font / 2 }))

const UNITS = new Units({ x: 5, y: 125 })

describe('Getting segmented bar box', () => {
    it('Should leave padding and stop overflow around bar without labels', () => {
        expect(getBarBox(UNITS, undefined, undefined))
            .toEqual({
                x: UNITS.x(7),
                y: UNITS.y(8),
                width: COORDS_MAX_X - UNITS.x(14),
                height: COORDS_MAX_Y - UNITS.y(16)
            })
    })

    it('Should leave space for left and right labels', () => {
        const box = getBarBox(UNITS, 'Lore', 'Ip')

        expect(box.x)
            .toBe(UNITS.x(7 + 24 + 12))
        expect(box.width)
            .toBe(COORDS_MAX_X - UNITS.x(7 + 24 + 12) - UNITS.x(7 + 12 + 12))
    })

    it('Should not produce negative size when paddings do not fit', () => {
        const box = getBarBox(new Units({ x: 5, y: 1000 }), 'Lore ipsum dolor', 'Sit amet')

        expect(box.height)
            .toBe(0)
        expect(getBarBox(new Units({ x: 1000, y: 1 }), 'Lore', 'Ip').width)
            .toBe(0)
    })
})