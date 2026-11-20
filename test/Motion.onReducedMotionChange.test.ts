import { onReducedMotionChange } from '@/helpers/Motion'

describe('Listening to reduced motion changes', () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).matchMedia
    })

    it('Should call the listener when the preference changes', () => {
        const query = { addEventListener: jest.fn(), removeEventListener: jest.fn() }
        const matchMedia = jest.fn(() => query)
        const listener = jest.fn()

        Object.assign(globalThis, { matchMedia })

        onReducedMotionChange(listener)

        expect([matchMedia.mock.calls[0], query.addEventListener.mock.calls[0]])
            .toEqual([['(prefers-reduced-motion: reduce)'], ['change', listener]])
    })

    it('Should stop listening after unsubscribing', () => {
        const query = { addEventListener: jest.fn(), removeEventListener: jest.fn() }
        const listener = jest.fn()

        Object.assign(globalThis, { matchMedia: () => query })

        onReducedMotionChange(listener)()

        expect(query.removeEventListener)
            .toHaveBeenCalledWith('change', listener)
    })

    it('Should do nothing without media query support', () => {
        expect(() => onReducedMotionChange(jest.fn())())
            .not.toThrow()
    })
})