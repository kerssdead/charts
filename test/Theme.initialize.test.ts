import Theme, { ColorTheme } from '@/Theme'

describe('Initializing theme', () => {
    let media: { matches: boolean, addEventListener: jest.Mock, removeEventListener: jest.Mock }

    beforeEach(() => {
        media = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }

        Object.assign(globalThis, { window: { matchMedia: () => media } })
    })

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window
    })

    it('Should use the dark theme function', () => {
        const theme = new Theme()

        theme.initialize(jest.fn(), () => true)

        expect(theme.colorTheme)
            .toBe(ColorTheme.dark)
        expect(theme.palette.isDark)
            .toBe(true)
    })

    it('Should fall back to the media query', () => {
        media.matches = true

        const theme = new Theme()

        theme.initialize(jest.fn())

        expect(theme.colorTheme)
            .toBe(ColorTheme.dark)
    })

    it('Should notify about media changes', () => {
        const theme = new Theme()
        const onChange = jest.fn()

        theme.initialize(onChange)

        const listener = media.addEventListener.mock.calls[0][1] as () => void

        media.matches = true
        listener()

        expect(theme.colorTheme)
            .toBe(ColorTheme.dark)
        expect(onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should attach one media listener', () => {
        const theme = new Theme()
        const onChange = jest.fn()

        theme.initialize(onChange)
        theme.initialize(onChange)

        expect(media.addEventListener)
            .toHaveBeenCalledTimes(1)
    })
})