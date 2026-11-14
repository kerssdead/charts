import Theme, { ColorTheme } from '@/Theme'
import ThemeOptions from '@/static/ThemeOptions'
import { ErrorType } from '@/static/Enums'

describe('Setting theme', () => {
    it('Should fail when canvas background is not a hex colour', () => {
        jest.replaceProperty(ThemeOptions.palettes[ColorTheme.dark], 'canvasBackground', 'black')

        expect(() => Theme.setTheme(ColorTheme.dark))
            .toThrow(ErrorType.InvalidHexColor)
    })
})

describe('Updating theme', () => {
    beforeEach(() => {
        Theme.currentTheme = ColorTheme.light
        Theme.media = undefined

        jest.replaceProperty(ThemeOptions.palettes[ColorTheme.dark], 'canvasBackground', '#000000')
    })

    it('Should switch to dark theme', () => {
        Theme.update(() => true)

        expect(Theme.currentTheme)
            .toBe(ColorTheme.dark)
    })

    it('Should switch back to light theme', () => {
        Theme.update(() => true)
        Theme.update(() => false)

        expect(Theme.currentTheme)
            .toBe(ColorTheme.light)
    })

    it('Should fall back to the media query without a theme function', () => {
        Theme.media = { matches: true } as unknown as MediaQueryList
        Theme.update()

        expect(Theme.currentTheme)
            .toBe(ColorTheme.dark)
    })
})