import { contrastTextColor } from '@/helpers/Color'

describe('Getting contrast text color', () => {
    it('Should use white on black and black on white', () => {
        expect(contrastTextColor('#000000')).toBe('#ffffff')
        expect(contrastTextColor('#ffffff')).toBe('#000000')
    })

    it('Should switch to black just above WCAG crossover luminance', () => {
        expect(contrastTextColor('#757575')).toBe('#ffffff')
        expect(contrastTextColor('#767676')).toBe('#000000')
    })

    it('Should use black on mid-luminance colors', () => {
        expect(contrastTextColor('#ff0000')).toBe('#000000')
        expect(contrastTextColor('#959595')).toBe('#000000')
    })

    it('Should use white on dark saturated colors', () => {
        expect(contrastTextColor('#0000ff')).toBe('#ffffff')
    })

    it('Should use white on non-hex color', () => {
        expect(contrastTextColor('red')).toBe('#ffffff')
    })
})