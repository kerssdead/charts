import Theme, { ColorTheme } from '@/Theme'

describe('Updating theme palette', () => {
    beforeEach(() => {
        const media = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }

        Object.assign(globalThis, { window: { matchMedia: () => media } })
    })

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window
    })

    it('Should switch to dark and back to light', () => {
        const theme = new Theme()

        theme.initialize(jest.fn(), () => false)

        expect(theme.updatePalette(() => true))
            .toBe(true)
        expect(theme.colorTheme)
            .toBe(ColorTheme.dark)

        expect(theme.updatePalette(() => false))
            .toBe(true)
        expect(theme.colorTheme)
            .toBe(ColorTheme.light)
    })

    it('Should keep chart palettes independent', () => {
        const dark = new Theme()
        const light = new Theme()

        dark.initialize(jest.fn(), () => true)
        light.initialize(jest.fn(), () => false)

        expect([dark.palette.isDark, light.palette.isDark])
            .toEqual([true, false])
        expect(dark.palette)
            .not.toBe(light.palette)
    })
})