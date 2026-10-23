import { normalizeColor } from '@/helpers/Color'

const VARIABLES: Record<string, string> = { '--accent': ' #ff0000 ', '--unset': '' }

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
        expect(normalizeColor('var(--accent)')).toBe('#ff0000')
        expect(normalizeColor(' var( --accent ) ')).toBe('#ff0000')
        expect(normalizeColor('--accent')).toBe('#ff0000')
    })

    it('Should use fallback when css variable is not set', () => {
        expect(normalizeColor('var(--unset, #00ff00)')).toBe('#00ff00')
    })

    it('Should keep hex colors as is', () => {
        expect(normalizeColor('#abc')).toBe('#aabbcc')
    })
})
