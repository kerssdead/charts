import { clearTextWidths, stringWidth } from '@/helpers/Text'

describe('Clearing text widths', () => {
    const measureText = jest.fn((text: string) => ({ width: text.length * 50 }))

    beforeAll(() => {
        Object.assign(globalThis, {
            document: { createElement: () => ({ getContext: () => ({ font: '', measureText }) }) }
        })
    })

    afterAll(() => {
        delete (globalThis as Record<string, unknown>).document
    })

    it('Should measure cached text again', () => {
        stringWidth('cached')
        stringWidth('cached')

        expect(measureText)
            .toHaveBeenCalledTimes(1)

        clearTextWidths()
        stringWidth('cached')

        expect(measureText)
            .toHaveBeenCalledTimes(2)
    })
})