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