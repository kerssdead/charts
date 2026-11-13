import { truncate } from '@/helpers/TextFit'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string) => text.length * 10 }))

describe('Truncating text', () => {
    it('Should keep label that fits', () => {
        expect(truncate('Hello', 50))
            .toBe('Hello')
    })

    it('Should cut label to fit with ellipsis', () => {
        expect(truncate('Hello world', 60))
            .toBe('Hello…')
    })

    it('Should leave only ellipsis when nothing fits', () => {
        expect(truncate('Hello', 5))
            .toBe('…')
    })
})