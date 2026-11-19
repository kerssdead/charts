import { formatPercent } from '@/helpers/Percent'
import { setLocalization } from '@/static/Localization'

describe('Formatting percent', () => {
    afterEach(() => setLocalization(undefined, undefined))

    it('Should format a ratio as percent', () => {
        expect(formatPercent(.5))
            .toBe('50%')
    })

    it('Should keep one fractional digit and drop trailing zeros by default', () => {
        expect([formatPercent(.1234), formatPercent(.12), formatPercent(1 / 3)])
            .toEqual(['12.3%', '12%', '33.3%'])
    })

    it('Should use given fraction digits', () => {
        expect([formatPercent(.25, 2, 2), formatPercent(.2512, 0, 0)])
            .toEqual(['25.00%', '25%'])
    })

    it('Should format zero and over one hundred percent', () => {
        expect([formatPercent(0), formatPercent(1.5)])
            .toEqual(['0%', '150%'])
    })

    it('Should follow the locale conventions', () => {
        setLocalization('de', undefined)

        expect(formatPercent(.125))
            .toBe('12,5 %')
    })

    it('Should switch format when locale changes back', () => {
        setLocalization('de', undefined)
        formatPercent(.125)
        setLocalization(undefined, undefined)

        expect(formatPercent(.125))
            .toBe('12.5%')
    })
})