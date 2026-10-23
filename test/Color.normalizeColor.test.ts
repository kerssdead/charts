import { normalizeColor } from '@/helpers/Color'

const VARIABLES: Record<string, string> = { '--color-danger': ' #ff0000 ', '--color-empty': '' }

describe('Normalizing color', () => {
    beforeEach(() => {
        (globalThis as any).document = { documentElement: {} };
        (globalThis as any).getComputedStyle = () => ({ getPropertyValue: (name: string) => VARIABLES[name] ?? '' })
    })

    afterEach(() => {
        delete (globalThis as any).document
        delete (globalThis as any).getComputedStyle
    })

    it('Should resolve css variables', () => {
        expect(normalizeColor('var(--color-danger)')).toBe('#ff0000')
        expect(normalizeColor(' var( --color-danger ) ')).toBe('#ff0000')
        expect(normalizeColor('--color-danger')).toBe('#ff0000')
    })

    it('Should use fallback when css variable is not set', () => {
        expect(normalizeColor('var(--color-empty, #00ff00)')).toBe('#00ff00')
    })

    it('Should keep hex colors as is', () => {
        expect(normalizeColor('#abc')).toBe('#aabbcc')
    })
})
