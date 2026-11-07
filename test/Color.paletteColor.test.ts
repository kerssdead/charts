import { paletteColor } from '@/helpers/Color'
import Palette from '@/static/constants/Palette'

describe('Getting palette color', () => {
    it('Should return palette colors in order', () => {
        expect(Palette.map((_, index) => paletteColor(index)))
            .toEqual([...Palette])
    })

    it('Should darken colors on second round', () => {
        expect(paletteColor(Palette.length))
            .toBe('#079749')
    })

    it('Should lighten colors on third round', () => {
        expect(paletteColor(Palette.length * 2))
            .toBe('#57e799')
    })

    it('Should darken colors further on fourth round', () => {
        expect(paletteColor(Palette.length * 3))
            .toBe('#006f21')
    })
})