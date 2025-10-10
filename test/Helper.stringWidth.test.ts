import { Helper } from '../src/Helper'

describe('Calculating string width', () => {
    it('Should calculate undefined string', () => {
        expect(Helper.stringWidth(undefined))
            .toBe(0)
    })

    it('Should calculate normal string', () => {
        expect(Helper.stringWidth('Test string'))
            .toBeCloseTo(65, 0)
    })
})