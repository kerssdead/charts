import { getLocale, setLocalization } from '@/static/Localization'
import TextResources from '@/static/TextResources'
import Translations from '@/static/Translations'

describe('Setting localization', () => {
    afterEach(() => setLocalization(undefined, undefined))

    it('Should use English texts by default', () => {
        expect([TextResources.reset, getLocale()])
            .toEqual(['Reset', undefined])
    })

    it('Should use the translation of the locale language', () => {
        setLocalization('fr', undefined)

        expect([TextResources.reset, getLocale()])
            .toEqual([Translations.fr.reset, 'fr'])
    })

    it('Should ignore region, case and separator style', () => {
        setLocalization('DE_at', undefined)

        expect(TextResources.reset)
            .toBe(Translations.de.reset)
    })

    it('Should prefer a regional translation', () => {
        setLocalization('zh-TW', undefined)

        expect(TextResources.reset)
            .toBe(Translations['zh-tw'].reset)
        expect(Translations['zh-tw'].reset)
            .not.toBe(Translations.zh.reset)
    })

    it('Should use Simplified Chinese for mainland locales', () => {
        setLocalization('zh-CN', undefined)

        expect(TextResources.reset)
            .toBe(Translations.zh.reset)
    })

    it('Should use English for languages without translation', () => {
        setLocalization('sv', undefined)

        expect(TextResources.reset)
            .toBe('Reset')
    })

    it('Should prefer custom strings over the translation', () => {
        setLocalization('fr', { reset: 'Recommencer' })

        expect([TextResources.reset, TextResources.copy])
            .toEqual(['Recommencer', Translations.fr.copy])
    })

    it('Should apply custom strings without locale', () => {
        setLocalization(undefined, { reset: 'Clear' })

        expect(TextResources.reset)
            .toBe('Clear')
    })

    it('Should forget previous strings and locale', () => {
        setLocalization('fr', { reset: 'Recommencer' })
        setLocalization(undefined, undefined)

        expect([TextResources.reset, getLocale()])
            .toEqual(['Reset', undefined])
    })

    it('Should not take translations from object prototype names', () => {
        setLocalization('constructor', undefined)

        expect(TextResources.reset)
            .toBe('Reset')
    })
})