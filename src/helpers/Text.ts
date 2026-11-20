import { localeCached } from '@/static/Localization'
import { getContext } from '@/helpers/Canvas'
import { Tag } from '@/static/Enums'
import { DEFAULT_FONT_SIZE } from '@/static/constants/Index'
import { getFontFamily } from '@/static/Typography'

const MEASURE_FONT_SIZE = 100

const SCRATCH_SIZE = 1

let scratch: CanvasRenderingContext2D | null = null

let scratchFontFamily: string | undefined

export function scratchContext() {
    if (!scratch) {
        const canvas = document.createElement(Tag.Canvas)

        canvas.width = SCRATCH_SIZE
        canvas.height = SCRATCH_SIZE

        scratch = getContext(canvas)
    }

    const fontFamily = getFontFamily()

    if (fontFamily !== scratchFontFamily) {
        scratchFontFamily = fontFamily
        scratch.font = `${ MEASURE_FONT_SIZE }px ${ fontFamily }`
    }

    return scratch
}

const MEASURE_CACHE_LIMIT = 10000

const textWidths = new Map<string, number>()

let cachedFontFamily: string | undefined

export function clearTextWidths() {
    textWidths.clear()
}

export function stringWidth(text: string | undefined, font: number = DEFAULT_FONT_SIZE) {
    if (!text)
        return 0

    const fontFamily = getFontFamily()

    if (fontFamily !== cachedFontFamily) {
        cachedFontFamily = fontFamily
        clearTextWidths()
    }

    let width = textWidths.get(text)

    if (width === undefined) {
        if (textWidths.size >= MEASURE_CACHE_LIMIT) {
            let count = MEASURE_CACHE_LIMIT / 2

            for (const key of textWidths.keys()) {
                textWidths.delete(key)

                if (--count === 0)
                    break
            }
        }

        width = scratchContext().measureText(text).width / MEASURE_FONT_SIZE

        textWidths.set(text, width)
    }

    return width * font
}

const HTML_ESCAPES: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
}

export function escapeHtml(value: unknown) {
    return String(value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPES[char])
}

const SHORT_THRESHOLD = 1e10

const SCIENTIFIC_THRESHOLD = 1e15

const getShortFormat = localeCached(locale => new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
}))

const getFullFormat = localeCached(locale => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }))

const getScientificFormat = localeCached(locale => {
    return new Intl.NumberFormat(locale, { notation: 'scientific', maximumFractionDigits: 1 })
})

export function short(value: number, isShort: boolean) {
    if (Math.abs(value) >= SCIENTIFIC_THRESHOLD)
        return scientific(value)

    if (!isShort && Math.abs(value) < SHORT_THRESHOLD) {
        return getFullFormat().format(value)
    }

    return getShortFormat().format(value)
}

export function scientific(value: number) {
    return value === 0 ? '0' : getScientificFormat().format(value)
}