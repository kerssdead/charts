import Translations from '@/static/Translations'
import TextResources from '@/static/TextResources'

const GLYPH_KEYS = ['sortAscending', 'sortDescending']

const textKeys = Object.keys(TextResources).filter(key => !GLYPH_KEYS.includes(key))

const REGIONAL_LANGUAGES = ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo']

const languages = Object.keys(Translations).filter(language => !REGIONAL_LANGUAGES.includes(language))

describe('Translations', () => {
    it('Should cover the planned languages', () => {
        expect(languages.sort())
            .toEqual(['ar', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'tr', 'zh'])
    })

    it.each(Object.keys(Translations))('Should translate every text in %s', language => {
        expect(Object.keys(Translations[language]).sort())
            .toEqual([...textKeys].sort())
    })

    it.each(Object.keys(Translations))('Should not leave empty texts in %s', language => {
        expect(Object.values(Translations[language]).filter(text => !text?.trim()))
            .toEqual([])
    })

    it.each(languages)('Should differ from English in %s', language => {
        expect(Translations[language].reset)
            .not.toBe(TextResources.reset)
    })
})