import { setLocalization } from '@/static/Localization'
import { short } from '@/helpers/Text'

describe('Getting short number', () => {
    afterEach(() => setLocalization(undefined, undefined))

    it('Should use full format', () => {
        expect(short(1234.567, false))
            .toBe('1,234.57')
    })

    it('Should use compact format when short', () => {
        expect(short(1234567, true))
            .toBe('1.2M')
    })

    it('Should use compact format from 10^10', () => {
        expect(short(1.5e10, false))
            .toBe('15B')
    })

    it('Should use compact format below 10^15', () => {
        expect(short(999e12, false))
            .toBe('999T')
    })

    it('Should use scientific format from 10^15', () => {
        expect(short(1e15, false))
            .toBe('1E15')
    })

    it('Should use scientific format for negative values', () => {
        expect(short(-2.5e20, true))
            .toBe('-2.5E20')
    })

    it('Should follow the chart locale', () => {
        setLocalization('de', undefined)

        expect([short(1234.567, false), short(1234567, true)])
            .toEqual(['1.234,57', '1,2\u00a0Mio.'])
    })
})