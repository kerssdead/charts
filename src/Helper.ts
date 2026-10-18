import Color from '@/types/Color'
import Point from '@/types/Point'
import Errors from '@/helpers/Errors'
import { ErrorType, Tag } from '@/static/Enums'
import { FONT_FAMILY } from '@/static/constants/Index'

export function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2))
}

export function boxEdgeDistance(angle: number, halfWidth: number, halfHeight: number) {
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))

    return Math.min(cos > 1e-6 ? halfWidth / cos : Infinity, sin > 1e-6 ? halfHeight / sin : Infinity)
}

export function placeNear(point: Point,
                          width: number,
                          height: number,
                          offset: number,
                          bounds: { x: number, y: number, width: number, height: number }): Point {
    let x = point.x + offset
    let y = point.y + offset

    if (x + width > bounds.x + bounds.width)
        x = point.x - offset - width

    if (y + height > bounds.y + bounds.height)
        y = point.y - offset - height

    return { x: Math.max(x, bounds.x), y: Math.max(y, bounds.y) }
}

export function grayScale(color: string) {
    return '#' + Array(4).join(Math.round([.3, .59, .11].reduce((a, v, i) => a + v * parseInt(color[2 * i + 1] + color[2 * i + 2], 16), 0) / 3).toString(16).padStart(2, '0'))
}

export function randomColor() {
    let letters = '0123456789ABCDEF',
        color = '#'
    for (let i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)]

    return color
}

const MEASURE_FONT_SIZE = 100

const MEASURE_CACHE_LIMIT = 10000

const textWidths = new Map<string, number>()

let measureContext: CanvasRenderingContext2D | null = null

export function stringWidth(str: any | undefined, font?: number) {
    if (!str)
        return 0

    const text = String(str)

    let width = textWidths.get(text)

    if (width == undefined) {
        if (!measureContext) {
            measureContext = document.createElement(Tag.Canvas).getContext('2d') ?? Errors.throw(ErrorType.NullContext)
            measureContext.font = `${ MEASURE_FONT_SIZE }px ${ FONT_FAMILY }`
        }

        if (textWidths.size >= MEASURE_CACHE_LIMIT)
            textWidths.clear()

        width = measureContext.measureText(text).width / MEASURE_FONT_SIZE

        textWidths.set(text, width)
    }

    return width * (font || 14)
}

export function guid() {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    return (S4() + S4() + '-' + S4() + '-4' + S4().slice(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase()
}

export function contrastText(background: string) {
    const { r, g, b } = hexToRgb(background)

    const channel = (value: number) => {
        const c = value / 255

        return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
    }

    const luminance = .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b)

    return (luminance + .05) / .05 > 1.05 / (luminance + .05) ? '#000000' : '#ffffff'
}

export function getColor(red: string, green: string, blue: string) {
    return {
        r: parseInt(red, 16),
        g: parseInt(green, 16),
        b: parseInt(blue, 16)
    } as Color
}

export function hexToRgb(hex: string): Color {
    if (hex.length > 4) {
        const value = getHexValues(hex)
        if (value)
            return getColor(value[1], value[2], value[3])
    } else {
        const value = getShortHexValues(hex)
        if (value)
            return getColor(
                value[1] + value[1],
                value[2] + value[2],
                value[3] + value[3]
            )
    }

    return new Color()
}

export function getHexValues(str: string) {
    return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str)
}

export function getShortHexValues(str: string) {
    return /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(str)
}

export function getRoundedValues(
    all: number[],
    targetTicks: number = 5,
    max?: number
) {
    if (!Array.isArray(all) || all.length === 0) {
        return []
    }

    const minVal = Math.min(0, ...all)
    const maxVal = max == undefined ? Math.max(0, ...all) : Math.min(max, Math.max(0, ...all))

    if (minVal === 0 && maxVal === 0) {
        return []
    }

    const intervals = targetTicks - 1

    const rawStep = (maxVal - minVal) / intervals

    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const normalizedStep = rawStep / magnitude

    const niceSteps = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

    const isFit = (step: number) => {
        const neg = minVal < 0 ? Math.ceil(Math.abs(minVal) / step) : 0
        const pos = maxVal > 0 ? Math.ceil(maxVal / step) : 0

        return neg + pos <= intervals
    }

    let prettyNormalizedStep
    if (max != undefined) {
        prettyNormalizedStep = normalizedStep
    } else {
        prettyNormalizedStep = niceSteps.find(nice => nice >= normalizedStep && isFit(nice * magnitude)) ?? 10
    }

    let step = prettyNormalizedStep * magnitude

    let negIntervals = 0
    let posIntervals = 0

    while (true) {
        negIntervals = minVal < 0 ? (max != undefined ? Math.round(Math.abs(minVal) / step) : Math.ceil(Math.abs(minVal) / step)) : 0
        posIntervals = maxVal > 0 ? (max != undefined ? Math.round(maxVal / step) : Math.ceil(maxVal / step)) : 0

        if (maxVal > 0 && posIntervals === 0) {
            posIntervals = 1
        }

        if (negIntervals + posIntervals <= intervals) {
            const remaining = intervals - (negIntervals + posIntervals)
            if (remaining > 0) {
                if (minVal === 0) {
                    posIntervals += remaining
                } else if (maxVal === 0) {
                    negIntervals += remaining
                } else {
                    for (let i = 0; i < remaining; i++) {
                        const negDeficit = negIntervals * step - Math.abs(minVal)
                        const posDeficit = posIntervals * step - maxVal
                        if (negDeficit < posDeficit) {
                            negIntervals++
                        } else {
                            posIntervals++
                        }
                    }
                }
            }
            break
        }

        step *= 1.25
    }

    const startTick = -negIntervals * step
    const ticks = []

    for (let i = 0; i < targetTicks; i++) {
        const val = startTick + i * step
        let fixedVal = Number(val.toFixed(12))
        if (fixedVal === 0)
            fixedVal = 0
        ticks.push(fixedVal)
    }

    return ticks
}

export function parseNumber(value: string | null | number, decimalSeparator: string = '.') {
    const simplify = (v: string) => {
        return !v
            ? 0
            : +(v.replace(',', '')
                .replace('.', '')
                .replace('-', ''))
    }

    const removeExtraZeros = (v: number) => {
        while (v % 10 == 0 && v != 0)
            v /= 10
        return v
    }

    const countLeadingZeros = (v: string) => {
        let count = 0
        while (v.length > 0 && v.slice(0, 1) == '0') {
            v = v.slice(1)
            count++
        }
        return v.length == 0 || count == 0 ? 0 : count
    }

    const getDividerForFractional = (v: string) => {
        let trimmed = v

        while (trimmed.length > 0 && trimmed[0] == '0')
            trimmed = trimmed.slice(1)

        while (trimmed.length > 0 && trimmed[trimmed.length - 1] == '0')
            trimmed = trimmed.slice(0, trimmed.length - 1)

        return Math.pow(10, countLeadingZeros(v) + trimmed.length)
    }

    if (!value)
        return 0

    if (typeof value == 'number')
        return value

    let split = value.split(decimalSeparator),
        left = simplify(split[0]),
        right = split.length > 1
            ? removeExtraZeros(simplify(split[1])) / getDividerForFractional(split[1])
            : 0

    if (split.length > 1 && split[1].length > 9) {
        const slice = split[1].slice(0, 8)

        right = removeExtraZeros(simplify(slice)) / getDividerForFractional(slice)
    }

    const negative = value.slice(0, 1) == '-' ? -1 : 1

    const result = (left + right / (right >= 1 ? Math.pow(10, `${right}`.length) : 1))
        * negative

    const localeString = result.toLocaleString()

    if (value.startsWith(localeString))
        return result
    else if (value.startsWith(localeString.replace(',', '!')
        .replace('.', ',')
        .replace('!', '.')))
        return result
    else if (value.startsWith(result.toString()))
        return result
    else if (value.startsWith(result.toString().replace(',', '!')
        .replace('.', ',')
        .replace('!', '.')))
        return result

    if (decimalSeparator == ',')
        return NaN

    return parseNumber(value, ',')
}

export function sum<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => acc + selector(value), 0)
}

export function deepClone<T>(value: T): T {
    if (Array.isArray(value))
        return value.map(deepClone) as T

    if (value instanceof Date)
        return new Date(value) as T

    if (value === null || typeof value != 'object')
        return value

    const copy = Object.create(Object.getPrototypeOf(value))

    for (const [key, item] of Object.entries(value))
        copy[key] = deepClone(item)

    return copy
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

export function short(value: any, isShort: boolean) {
    if (!isShort) {
        return value.toString()
    }

    const parsed = parseNumber(value)

    return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    }).format(parsed)
}