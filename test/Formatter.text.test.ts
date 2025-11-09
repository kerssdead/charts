import Formatter from '../src/helpers/Formatter'

describe('Getting formatted text', () => {
    it('Text', () => {
        expect(Formatter.text('Test string'))
            .toBe('Test string')
    })

    it('Undefined text', () => {
        expect(Formatter.text(undefined))
            .toBe('')
    })
})