import { getPackedAlpha, packColor, scalePackedAlpha } from '@/helpers/PackedColor'

const COLOR = packColor('#102030')

describe('Scaling the alpha of a packed color', () => {
    it('Should scale the alpha by the factor', () => {
        expect(getPackedAlpha(scalePackedAlpha(COLOR, .5)))
            .toBe(128)
    })

    it('Should keep red, green and blue', () => {
        expect(scalePackedAlpha(COLOR, .5) & 0xffffff)
            .toBe(COLOR & 0xffffff)
    })

    it('Should keep the color as is for a factor of one', () => {
        expect(scalePackedAlpha(COLOR, 1))
            .toBe(COLOR)
    })

    it('Should make the color transparent for a factor of zero', () => {
        expect(getPackedAlpha(scalePackedAlpha(COLOR, 0)))
            .toBe(0)
    })

    it('Should give an unsigned value', () => {
        expect(scalePackedAlpha(COLOR, 1))
            .toBeGreaterThan(0)
    })
})