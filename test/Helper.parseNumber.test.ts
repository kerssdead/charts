import * as Helper from 'Helper'

describe('Parsing string to number', () => {
    it('US, no thousands', () => {
        expect(Helper.parseNumber('123.45'))
            .toStrictEqual(123.45)
    })

    it('US, thousands', () => {
        expect(Helper.parseNumber('123,456.789'))
            .toStrictEqual(123456.789)
    })

    it('EU, no thousands', () => {
        expect(Helper.parseNumber('123,45'))
            .toStrictEqual(123.45)
    })

    it('EU, thousands', () => {
        expect(Helper.parseNumber('123.456,789'))
            .toStrictEqual(123456.789)
    })

    it('US, performance test, 10000 values', () => {
        const start = performance.now()

        for (let i = 0; i < 10000; i++)
            expect(Helper.parseNumber('123,456.789'))
                .toStrictEqual(123456.789)

        expect(performance.now() - start)
            .toBeLessThanOrEqual(300)
    })

    it('EU, performance test, 10000 values', () => {
        const start = performance.now()

        for (let i = 0; i < 10000; i++)
            expect(Helper.parseNumber('123.456,789'))
                .toStrictEqual(123456.789)

        expect(performance.now() - start)
            .toBeLessThanOrEqual(300)
    })

    it('US, 0 test', () => {
        expect(Helper.parseNumber('0.00'))
            .toStrictEqual(0)
    })

    it('EU, 0 test', () => {
        expect(Helper.parseNumber('0,00'))
            .toStrictEqual(0)
    })

    it('US, thousands, negative', () => {
        expect(Helper.parseNumber('-123,456.789'))
            .toStrictEqual(-123456.789)
    })

    it('EU, thousands', () => {
        expect(Helper.parseNumber('-123.456,789'))
            .toStrictEqual(-123456.789)
    })

    it('unformatted, thousands', () => {
        expect(Helper.parseNumber('2376.00'))
            .toStrictEqual(2376)
    })

    it('null', () => {
        expect(Helper.parseNumber(null))
            .toStrictEqual(0)
    })

    it('number', () => {
        expect(Helper.parseNumber(123))
            .toStrictEqual(123)
    })

    it('US, fractional', () => {
        expect(Helper.parseNumber('0.07'))
            .toStrictEqual(.07)
    })

    it('EU, fractional', () => {
        expect(Helper.parseNumber('0,07'))
            .toStrictEqual(.07)
    })
})