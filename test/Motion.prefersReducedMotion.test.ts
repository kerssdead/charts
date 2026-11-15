import { prefersReducedMotion } from '@/helpers/Motion'

describe('Checking reduced motion preference', () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).matchMedia
    })

    it('Should follow the reduced motion media query', () => {
        const matchMedia = jest.fn(() => ({ matches: true }))

        Object.assign(globalThis, { matchMedia })

        expect(prefersReducedMotion())
            .toBe(true)
        expect(matchMedia)
            .toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })

    it('Should keep animations when the preference is not set', () => {
        Object.assign(globalThis, { matchMedia: () => ({ matches: false }) })

        expect(prefersReducedMotion())
            .toBe(false)
    })
})
