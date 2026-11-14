import { stringWidth } from '@/helpers/Text'

describe('Calculating string width', () => {
    const measureText = jest.fn((text: string) => ({ width: text.length * 50 }))

    beforeAll(() => {
        (globalThis as any).document = { createElement: () => ({ getContext: () => ({ font: '', measureText }) }) }
    })

    afterAll(() => {
        delete (globalThis as any).document
    })

    it('Should calculate undefined string', () => {
        expect(stringWidth(undefined))
            .toBe(0)
    })

    it('Should calculate normal string', () => {
        expect(stringWidth('Test string'))
            .toBeCloseTo(77, 5)
    })

    it('Should scale with font size and cache measurements', () => {
        expect(stringWidth('Test string', 20))
            .toBeCloseTo(110, 5)

        expect(measureText)
            .toHaveBeenCalledTimes(1)
    })

    it('Should prune the measurement cache when it is full', () => {
        stringWidth('first')

        for (let i = 0; i < 10001; i++)
            stringWidth(`text ${ i }`)

        stringWidth('first')

        expect(measureText.mock.calls.filter(call => call[0] === 'first'))
            .toHaveLength(2)
    })
})