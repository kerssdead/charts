import { normalizeColor, adjustColor } from '@/helpers/Color'

const VARIABLES: Record<string, string> = { '--accent': ' #ff0000 ', '--unset': '' }

let style = ''

const context = {
    get fillStyle() {
        return style
    },

    set fillStyle(value: string) {
        style = value
    },

    clearRect: jest.fn(),

    fillRect: jest.fn(),

    getImageData: jest.fn(() => ({ data: [255, 0, 0, 255] }))
}

describe('Normalizing color', () => {
    beforeEach(() => {
        (globalThis as any).document = {
            documentElement: {},
            createElement: () => ({ getContext: () => context })
        };
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

describe('Normalizing named colors', () => {
    beforeEach(() => {
        (globalThis as any).document = {
            documentElement: {},
            createElement: () => ({ getContext: () => context })
        }
    })

    afterEach(() => {
        delete (globalThis as any).document
    })

    it('Should normalize rgb colors', () => {
        expect(normalizeColor('rgb(255, 0, 0)'))
            .toBe('#ff0000')
    })

    it('Should normalize rgba colors with alpha', () => {
        expect(normalizeColor('rgba(255, 0, 0, 0.5)'))
            .toBe('#ff000080')
    })

    it('Should read the pixel when the browser keeps the color name', () => {
        expect(normalizeColor('red'))
            .toBe('#ff0000')
        expect(context.clearRect)
            .toHaveBeenCalledWith(0, 0, 1, 1)
        expect(context.fillRect)
            .toHaveBeenCalledWith(0, 0, 1, 1)
    })

    it('Should return the browser style when it is already a hex color', () => {
        expect(normalizeColor('#12'))
            .toBe('#12')
    })
})

describe('Adjusting color', () => {
    beforeEach(() => {
        (globalThis as any).document = {
            documentElement: {},
            createElement: () => ({ getContext: () => context })
        }
    })

    afterEach(() => {
        delete (globalThis as any).document
    })

    it('Should keep colors that cannot be parsed', () => {
        expect(adjustColor('red', 10))
            .toBe('red')
    })
})
