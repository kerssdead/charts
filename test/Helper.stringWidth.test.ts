import * as Helper from '@/Helper'

describe('Calculating string width', () => {
    const measureText = jest.fn((text: string) => ({ width: text.length * 50 }))

    beforeAll(() => {
        (globalThis as any).document = { createElement: () => ({ getContext: () => ({ font: '', measureText }) }) }
    })

    afterAll(() => {
        delete (globalThis as any).document
    })

    it('Should calculate undefined string', () => {
        expect(Helper.stringWidth(undefined))
            .toBe(0)
    })

    it('Should calculate normal string', () => {
        expect(Helper.stringWidth('Test string'))
            .toBeCloseTo(77, 5)
    })

    it('Should scale with font size and cache measurements', () => {
        expect(Helper.stringWidth('Test string', 20))
            .toBeCloseTo(110, 5)

        expect(measureText)
            .toHaveBeenCalledTimes(1)
    })
})