import { luminance } from '@/helpers/Color'

describe('Getting luminance', () => {
    it('Should give 0 for black and 1 for white', () => {
        expect(luminance('#000000')).toBe(0)
        expect(luminance('#ffffff')).toBeCloseTo(1)
    })

    it('Should weight channels by WCAG coefficients', () => {
        expect(luminance('#ff0000')).toBeCloseTo(.2126)
        expect(luminance('#00ff00')).toBeCloseTo(.7152)
        expect(luminance('#0000ff')).toBeCloseTo(.0722)
    })

    it('Should linearize mid-tone channels', () => {
        expect(luminance('#808080')).toBeCloseTo(.2159)
    })

    it('Should scale linearly for very dark channels', () => {
        expect(luminance('#0a0a0a')).toBeCloseTo(10 / 255 / 12.92, 5)
    })

    it('Should expand short hex', () => {
        expect(luminance('#fff')).toBeCloseTo(1)
    })

    it('Should ignore alpha', () => {
        expect(luminance('#ff000080')).toBeCloseTo(.2126)
    })

    it('Should treat non-hex color as black', () => {
        expect(luminance('red')).toBe(0)
    })
})