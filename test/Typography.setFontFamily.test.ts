import { getFontFamily, setFontFamily, SYSTEM_FONT_FAMILY } from '@/static/Typography'

describe('Setting font family', () => {
    afterEach(() => setFontFamily(undefined))

    it('Should use the system font stack by default', () => {
        expect(getFontFamily())
            .toBe(SYSTEM_FONT_FAMILY)
    })

    it('Should use the given font family', () => {
        setFontFamily('"Helvetica Neue", Arial')

        expect(getFontFamily())
            .toBe('"Helvetica Neue", Arial')
    })

    it('Should trim the font family', () => {
        setFontFamily('  Georgia  ')

        expect(getFontFamily())
            .toBe('Georgia')
    })

    it('Should fall back to the system font stack for empty values', () => {
        setFontFamily('Georgia')
        setFontFamily('   ')

        expect(getFontFamily())
            .toBe(SYSTEM_FONT_FAMILY)
    })

    it('Should reset to the system font stack', () => {
        setFontFamily('Georgia')
        setFontFamily(undefined)

        expect(getFontFamily())
            .toBe(SYSTEM_FONT_FAMILY)
    })
})