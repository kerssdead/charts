import { ColorTheme, createTheme, hoverBackground } from '@/Theme'
import { adjustColor } from '@/helpers/Color'

describe('Getting hover background', () => {
    it('Should lighten dark and darken light canvas backgrounds', () => {
        const light = createTheme(ColorTheme.light)
        const dark = createTheme(ColorTheme.dark)

        expect([hoverBackground(light, 0), hoverBackground(dark, 0)])
            .toEqual([light.canvasBackground, dark.canvasBackground])
        expect(hoverBackground(light, 1))
            .toBe(adjustColor(light.canvasBackground, -25))
        expect(hoverBackground(dark, 1))
            .toBe(adjustColor(dark.canvasBackground, 25))
    })
})