import Formatter from '@/helpers/Formatter'

describe('Getting formatted number', () => {
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
})