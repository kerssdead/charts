import Legend from '@/Legend'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string) => text.length * 10 }))

describe('Truncating legend labels', () => {
    it('Should keep label that fits', () => {
        expect(Legend.truncate('Hello', 50))
            .toBe('Hello')
    })

    it('Should cut label to fit with ellipsis', () => {
        expect(Legend.truncate('Hello world', 60))
            .toBe('Hello…')
    })

    it('Should leave only ellipsis when nothing fits', () => {
        expect(Legend.truncate('Hello', 5))
            .toBe('…')
    })
})