import { grayScale } from '@/helpers/Color'

describe('Converting color to gray scale', () => {
    it('Should return the same color for zero amount', () => {
        expect(grayScale('#336699', 0))
            .toBe('#336699')
    })

    it('Should return non hex color as is for zero amount', () => {
        expect(grayScale('red', 0))
            .toBe('red')
    })

    it('Should convert color to gray for full amount', () => {
        expect(grayScale('#ff0000'))
            .toBe('#4d4d4d')
    })

    it('Should keep alpha channel', () => {
        expect(grayScale('#ff000080'))
            .toBe('#4d4d4d80')
    })

    it('Should return non hex color as is', () => {
        expect(grayScale('red'))
            .toBe('red')
    })
})