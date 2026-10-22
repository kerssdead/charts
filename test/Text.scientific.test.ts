import { scientific } from '@/helpers/Text'

describe('Getting scientific number', () => {
    it('Should format value', () => {
        expect(scientific(1.2e41))
            .toBe('1.2E41')
    })

    it('Should round to one fraction digit', () => {
        expect(scientific(123456))
            .toBe('1.2E5')
    })

    it('Should format zero', () => {
        expect(scientific(0))
            .toBe('0')
    })
})