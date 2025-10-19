import { Formatter } from '../src/helpers/Formatter'

describe('Getting formatted date', () => {
    it('Date', () => {
        expect(Formatter.date(new Date('2011-12-30')))
            .toBe('12/30/2011')
    })

    it('Undefined date', () => {
        expect(Formatter.date(undefined))
            .toBe('')
    })
})