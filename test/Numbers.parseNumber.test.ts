import { parseNumber } from '@/helpers/Numbers'

const measureParsing = (text: string, locale?: string) => {
    const start = performance.now()
    let parsed = 0

    for (let i = 0; i < 10000; i++)
        parsed = parseNumber(text, locale)

    return { parsed, elapsed: performance.now() - start }
}

const NumberFormat = Intl.NumberFormat

const parseForViewer = (text: string, viewerLocale: string) => {
    jest.spyOn(Intl, 'NumberFormat').mockImplementation((locale, options) => {
        return new NumberFormat(locale ?? viewerLocale, options)
    })

    let parsed = NaN

    jest.isolateModules(() => {
        const numbers: typeof import('@/helpers/Numbers') = require('@/helpers/Numbers')

        parsed = numbers.parseNumber(text)
    })

    return parsed
}

describe('Parsing string to number', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('US, no thousands', () => {
        expect(parseNumber('123.45'))
            .toStrictEqual(123.45)
    })

    it('US, thousands', () => {
        expect(parseNumber('123,456.789'))
            .toStrictEqual(123456.789)
    })

    it('EU, no thousands', () => {
        expect(parseNumber('123,45'))
            .toStrictEqual(123.45)
    })

    it('EU, thousands', () => {
        expect(parseNumber('123.456,789'))
            .toStrictEqual(123456.789)
    })

    it('US, performance test, 10000 values', () => {
        const { parsed, elapsed } = measureParsing('123,456.789')

        expect(parsed)
            .toStrictEqual(123456.789)
        expect(elapsed)
            .toBeLessThanOrEqual(600)
    })

    it('EU, performance test, 10000 values', () => {
        const { parsed, elapsed } = measureParsing('123.456,789')

        expect(parsed)
            .toStrictEqual(123456.789)
        expect(elapsed)
            .toBeLessThanOrEqual(600)
    })

    it('US, 0 test', () => {
        expect(parseNumber('0.00'))
            .toStrictEqual(0)
    })

    it('EU, 0 test', () => {
        expect(parseNumber('0,00'))
            .toStrictEqual(0)
    })

    it('US, thousands, negative', () => {
        expect(parseNumber('-123,456.789'))
            .toStrictEqual(-123456.789)
    })

    it('EU, thousands', () => {
        expect(parseNumber('-123.456,789'))
            .toStrictEqual(-123456.789)
    })

    it('unformatted, thousands', () => {
        expect(parseNumber('2376.00'))
            .toStrictEqual(2376)
    })

    it('null', () => {
        expect(parseNumber(null))
            .toStrictEqual(0)
    })

    it('number', () => {
        expect(parseNumber(123))
            .toStrictEqual(123)
    })

    it('US, fractional', () => {
        expect(parseNumber('0.07'))
            .toStrictEqual(.07)
    })

    it('EU, fractional', () => {
        expect(parseNumber('0,07'))
            .toStrictEqual(.07)
    })

    it('US, fractional with trailing zero', () => {
        expect(parseNumber('0.10'))
            .toStrictEqual(0.1)
    })

    it('EU, fractional with trailing zero', () => {
        expect(parseNumber('0,10'))
            .toStrictEqual(0.1)
    })

    it('US, fractional with trailing zero 2', () => {
        expect(parseNumber('0.20'))
            .toStrictEqual(0.2)
    })

    it('EU, fractional with trailing zero 2', () => {
        expect(parseNumber('0,20'))
            .toStrictEqual(0.2)
    })

    it('US, fractional with long number after delimiter', () => {
        expect(parseNumber('14428822.674915052135873742887'))
            .toStrictEqual(14428822.674915053)
    })

    it('EU, fractional with long number after delimiter', () => {
        expect(parseNumber('14428822,674915052135873742887'))
            .toStrictEqual(14428822.674915053)
    })

    it ('US, fractional with long number after delimiter 2', () => {
        expect(parseNumber('202136.25625008223359376756160'))
            .toStrictEqual(202136.25625008222)
    })

    it ('EU, fractional with long number after delimiter 2', () => {
        expect(parseNumber('202136,25625008223359376756160'))
            .toStrictEqual(202136.25625008222)
    })

    it('US, fractional with long number with trailing zeros', () => {
        expect(parseNumber('144587.045000000000'))
            .toStrictEqual(144587.045)
    })

    it('EU, fractional with long number with trailing zeros', () => {
        expect(parseNumber('144587,045000000000'))
            .toStrictEqual(144587.045)
    })

    it('not a number', () => {
        expect(parseNumber('abc'))
            .toStrictEqual(NaN)
    })

    it('space as thousands separator', () => {
        expect(parseNumber('1 000'))
            .toStrictEqual(1000)
    })

    it('FR, non-breaking spaces as thousands separator', () => {
        expect(parseNumber('1\u202f234\u00a0567,89'))
            .toStrictEqual(1234567.89)
    })

    it('CH, apostrophe as thousands separator', () => {
        expect(parseNumber("1'234'567.89"))
            .toStrictEqual(1234567.89)
    })

    it('IN, lakh grouping', () => {
        expect(parseNumber('12,34,567.89'))
            .toStrictEqual(1234567.89)
    })

    it('EU, thousands without fraction', () => {
        expect(parseNumber('1.234.567'))
            .toStrictEqual(1234567)
    })

    it('leading zero is never grouping', () => {
        expect(parseNumber('0,123'))
            .toStrictEqual(.123)
    })

    it('unicode minus', () => {
        expect(parseNumber('\u22121.234,5'))
            .toStrictEqual(-1234.5)
    })

    it('exponent', () => {
        expect(parseNumber('1.5e-7'))
            .toStrictEqual(1.5e-7)
    })

    it('trailing garbage', () => {
        expect(parseNumber('12abc'))
            .toStrictEqual(NaN)
    })

    it('single comma with three digits is thousands for every viewer locale', () => {
        expect([parseForViewer('1,234', 'en-US'), parseForViewer('1,234', 'de-DE')])
            .toStrictEqual([1234, 1234])
    })

    it('single dot with three digits is decimal for every viewer locale', () => {
        expect([parseForViewer('1.234', 'en-US'), parseForViewer('1.234', 'de-DE')])
            .toStrictEqual([1.234, 1.234])
    })

    it('DE locale, dot is thousands', () => {
        expect(parseNumber('1.234', 'de-DE'))
            .toStrictEqual(1234)
    })

    it('DE locale, thousands and fraction', () => {
        expect(parseNumber('-1.234.567,89', 'de-DE'))
            .toStrictEqual(-1234567.89)
    })

    it('US locale, comma is thousands', () => {
        expect(parseNumber('1,5', 'en-US'))
            .toStrictEqual(15)
    })

    it('FR locale, narrow no-break space as thousands', () => {
        expect(parseNumber('1\u202f234,5', 'fr-FR'))
            .toStrictEqual(1234.5)
    })

    it('CH locale, apostrophe as thousands', () => {
        expect(parseNumber('1\u2019234.5', 'de-CH'))
            .toStrictEqual(1234.5)
    })

    it('ES locale, four digits without grouping', () => {
        expect(parseNumber('1234,5', 'es-ES'))
            .toStrictEqual(1234.5)
    })

    it('locale, second decimal separator is not a number', () => {
        expect(parseNumber('1,2,3', 'de-DE'))
            .toStrictEqual(NaN)
    })

    it('locale, number is returned as is', () => {
        expect(parseNumber(1.5, 'de-DE'))
            .toStrictEqual(1.5)
    })

    it('DE locale, performance test, 10000 values', () => {
        const { parsed, elapsed } = measureParsing('1.234.567,89', 'de-DE')

        expect(parsed)
            .toStrictEqual(1234567.89)
        expect(elapsed)
            .toBeLessThanOrEqual(600)
    })
})