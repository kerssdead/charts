import fail from '@/helpers/Errors'
import { ErrorType, Tag } from '@/static/Enums'
import { FONT_FAMILY } from '@/static/constants/Index'

const MEASURE_FONT_SIZE = 100

let scratch: CanvasRenderingContext2D | null = null

export function scratchContext() {
    if (!scratch) {
        scratch = document.createElement(Tag.Canvas).getContext('2d') ?? fail(ErrorType.NullContext)
        scratch.font = `${ MEASURE_FONT_SIZE }px ${ FONT_FAMILY }`
    }

    return scratch
}

const MEASURE_CACHE_LIMIT = 10000

const textWidths = new Map<string, number>()

export function stringWidth(str: string | undefined, font?: number) {
    if (!str)
        return 0

    const text = str

    let width = textWidths.get(text)

    if (width == undefined) {
        if (textWidths.size >= MEASURE_CACHE_LIMIT) {
            let count = MEASURE_CACHE_LIMIT / 2

            for (const key of textWidths.keys()) {
                textWidths.delete(key)

                if (--count == 0)
                    break
            }
        }

        width = scratchContext().measureText(text).width / MEASURE_FONT_SIZE

        textWidths.set(text, width)
    }

    return width * (font || 14)
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

let shortFormat: Intl.NumberFormat | undefined

let fullFormat: Intl.NumberFormat | undefined

let scientificFormat: Intl.NumberFormat | undefined

export function short(value: number, isShort: boolean) {
    if (Math.abs(value) >= SCIENTIFIC_THRESHOLD)
        return scientific(value)

    if (!isShort && Math.abs(value) < SHORT_THRESHOLD) {
        fullFormat ??= new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

        return fullFormat.format(value)
    }

    shortFormat ??= new Intl.NumberFormat(undefined, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    })

    return shortFormat.format(value)
}

export function scientific(value: number) {
    scientificFormat ??= new Intl.NumberFormat(undefined, { notation: 'scientific', maximumFractionDigits: 1 })

    return value == 0 ? '0' : scientificFormat.format(value)
}