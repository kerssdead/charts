import { setLocalization } from '@/static/Localization'
import Formatter from '@/helpers/Formatter'

describe('Getting formatted number', () => {
    afterEach(() => setLocalization(undefined, undefined))

    it('Number', () => {
        expect(Formatter.number(1000000))
            .toBe('1,000,000.00')
    })

    it('Undefined number', () => {
        expect(Formatter.number(undefined))
            .toBe('')
    })

    it('NaN number', () => {
        expect(Formatter.number(NaN))
            .toBe('NaN')
    })

    it('String value', () => {
        expect(Formatter.number('text' as unknown as number))
            .toBe('text')
    })

    it('Should follow the chart locale', () => {
        setLocalization('de', undefined)

        expect(Formatter.number(1234.5))
            .toBe('1.234,50')
    })
})