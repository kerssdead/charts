import * as Helper from 'Helper'
import Utils from '../e2e/utils/Utils'

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

        Utils.elapsed(start, 600)
    })

    it('EU, performance test, 10000 values', () => {
        const start = performance.now()

        for (let i = 0; i < 10000; i++)
            expect(Helper.parseNumber('123.456,789'))
                .toStrictEqual(123456.789)

        Utils.elapsed(start, 600)
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

    it('US, fractional with trailing zero', () => {
        expect(Helper.parseNumber('0.10'))
            .toStrictEqual(0.1)
    })

    it('EU, fractional with trailing zero', () => {
        expect(Helper.parseNumber('0,10'))
            .toStrictEqual(0.1)
    })

    it('US, fractional with trailing zero 2', () => {
        expect(Helper.parseNumber('0.20'))
            .toStrictEqual(0.2)
    })

    it('EU, fractional with trailing zero 2', () => {
        expect(Helper.parseNumber('0,20'))
            .toStrictEqual(0.2)
    })

    it('US, fractional with long number after delimiter', () => {
        expect(Helper.parseNumber('14428822.674915052135873742887'))
            .toStrictEqual(14428822.67491505)
    })

    it('EU, fractional with long number after delimiter', () => {
        expect(Helper.parseNumber('14428822,674915052135873742887'))
            .toStrictEqual(14428822.67491505)
    })

    it ('US, fractional with long number after delimiter 2', () => {
        expect(Helper.parseNumber('202136.25625008223359376756160'))
            .toStrictEqual(202136.25625008)
    })

    it ('EU, fractional with long number after delimiter 2', () => {
        expect(Helper.parseNumber('202136,25625008223359376756160'))
            .toStrictEqual(202136.25625008)
    })

    it('US, fractional with long number with trailing zeros', () => {
        expect(Helper.parseNumber('144587.045000000000'))
            .toStrictEqual(144587.045)
    })

    it('EU, fractional with long number with trailing zeros', () => {
        expect(Helper.parseNumber('144587,045000000000'))
            .toStrictEqual(144587.045)
    })
})