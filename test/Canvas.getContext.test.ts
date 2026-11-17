import { getContext } from '@/helpers/Canvas'

describe('Getting canvas context', () => {
    it('Should return the 2d context with the read hint', () => {
        const ctx = {}
        const getContextMock = jest.fn(() => ctx)

        expect(getContext({ getContext: getContextMock } as unknown as HTMLCanvasElement, true))
            .toBe(ctx)
        expect(getContextMock)
            .toHaveBeenCalledWith('2d', { willReadFrequently: true })
    })

    it('Should not hint frequent reads by default', () => {
        const getContextMock = jest.fn(() => ({}))

        getContext({ getContext: getContextMock } as unknown as HTMLCanvasElement)

        expect(getContextMock)
            .toHaveBeenCalledWith('2d', { willReadFrequently: false })
    })

    it('Should fail when the canvas has no context', () => {
        expect(() => getContext({ getContext: () => null } as unknown as HTMLCanvasElement))
            .toThrow()
    })
})
