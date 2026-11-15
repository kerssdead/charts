import { ColorTheme, createTheme } from '@/Theme'
import ThemeOptions from '@/static/ThemeOptions'
import { ErrorType } from '@/static/Enums'

describe('Creating theme', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('Should fail when canvas background is not a hex colour', () => {
        jest.replaceProperty(ThemeOptions.palettes[ColorTheme.dark], 'canvasBackground', 'black')

        expect(() => createTheme(ColorTheme.dark))
            .toThrow(ErrorType.InvalidHexColor)
    })

    it('Should build light and dark palettes', () => {
        const light = createTheme(ColorTheme.light)
        const dark = createTheme(ColorTheme.dark)

        expect([light.isDark, light.background, dark.isDark, dark.canvasBackground])
            .toEqual([false, '#f7f7f7', true, '#222222'])
        expect(light.floatingBackground)
            .toBe('#f7f7f780')
        expect(dark.floatingBackground)
            .toBe('#22222273')
        expect(Object.isFrozen(dark))
            .toBe(true)
    })
})