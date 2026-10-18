import Color from '@/types/Color'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import Errors from '@/helpers/Errors'
import { ErrorType, Tag } from '@/static/Enums'
import { FONT_FAMILY } from '@/static/constants/Index'

export function adjustColor(color: string, amount: number) {
    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    return '#' + [rgb.r, rgb.g, rgb.b].map(channel => toHex(channel + amount)).join('')
}

function toHex(channel: number) {
    return Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0')
}

let colorContext: CanvasRenderingContext2D | null = null

export function normalizeColor(color: string) {
    if (color.startsWith('#')) {
        const short = getShortHexValues(color)

        if (short)
            return '#' + short.slice(1).filter(Boolean).map(value => value + value).join('')

        if (getHexValues(color))
            return color
    }

    colorContext ??= document.createElement(Tag.Canvas).getContext('2d') ?? Errors.throw(ErrorType.NullContext)
    colorContext.fillStyle = '#000000'
    colorContext.fillStyle = color

    const style = String(colorContext.fillStyle)
    const rgba = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(style)

    if (!rgba)
        return style

    return '#' + toHex(+rgba[1]) + toHex(+rgba[2]) + toHex(+rgba[3]) + (rgba[4] == undefined ? '' : toHex(+rgba[4] * 255))
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
                          bounds: RectangleDimensions): Point {
    let x = point.x + offset
    let y = point.y + offset

    if (x + width > bounds.x + bounds.width)
        x = point.x - offset - width

    if (y + height > bounds.y + bounds.height)
        y = point.y - offset - height

    return { x: Math.max(x, bounds.x), y: Math.max(y, bounds.y) }
}

export function contains(rect: RectangleDimensions, point: Point | null) {
    return !!point
           && rect.x <= point.x && point.x <= rect.x + rect.width
           && rect.y <= point.y && point.y <= rect.y + rect.height
}

export function grayScale(color: string) {
    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    return '#' + toHex(.3 * rgb.r + .59 * rgb.g + .11 * rgb.b).repeat(3)
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

        if (textWidths.size >= MEASURE_CACHE_LIMIT) {
            let count = MEASURE_CACHE_LIMIT / 2

            for (const key of textWidths.keys()) {
                textWidths.delete(key)

                if (--count == 0)
                    break
            }
        }

        width = measureContext.measureText(text).width / MEASURE_FONT_SIZE

        textWidths.set(text, width)
    }

    return width * (font || 14)
}

export function contrastText(background: string) {
    const { r, g, b } = hexToRgb(background) ?? { r: 0, g: 0, b: 0 }

    const channel = (value: number) => {
        const c = value / 255

        return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
    }

    const luminance = .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b)

    return (luminance + .05) / .05 > 1.05 / (luminance + .05) ? '#000000' : '#ffffff'
}

function getColor(red: string, green: string, blue: string): Color {
    return {
        r: parseInt(red, 16),
        g: parseInt(green, 16),
        b: parseInt(blue, 16)
    }
}

export function hexToRgb(hex: string): Color | null {
    const value = getHexValues(hex)
    if (value)
        return getColor(value[1], value[2], value[3])

    const short = getShortHexValues(hex)
    if (short)
        return getColor(
            short[1] + short[1],
            short[2] + short[2],
            short[3] + short[3]
        )

    return null
}

function getHexValues(str: string) {
    return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str)
}

function getShortHexValues(str: string) {
    return /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i.exec(str)
}

export function getRoundedValues(
    all: number[],
    targetTicks: number = 5,
    max?: number
) {
    if (!Array.isArray(all) || all.length === 0 || targetTicks < 2) {
        return []
    }

    const dataMax = maxOf(all, value => value)
    const minVal = all.reduce((acc, value) => Math.min(acc, value), 0)
    const maxVal = max == undefined ? dataMax : Math.min(max, dataMax)

    if (!Number.isFinite(minVal) || !Number.isFinite(maxVal) || minVal === 0 && maxVal === 0) {
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

const NUMBER_PATTERN = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

const GROUP_SPACES = /[\s\u00a0\u202f'\u2019_]/g

const MINUS = /^[-\u2212]/

let localeGroup: string | undefined

function isGrouping(text: string, separator: string) {
    localeGroup ??= new Intl.NumberFormat().formatToParts(1000).find(part => part.type == 'group')?.value ?? ','

    const [integer, fraction] = text.split(separator)

    return separator == localeGroup && /^[1-9]\d{0,2}$/.test(integer) && /^\d{3}$/.test(fraction)
}

export function parseNumber(value: string | number | null | undefined): number {
    if (value == null || value === '')
        return 0

    if (typeof value == 'number')
        return value

    let text = String(value).replace(GROUP_SPACES, '')
    let sign = 1

    if (MINUS.test(text)) {
        sign = -1
        text = text.slice(1)
    } else if (text.startsWith('+')) {
        text = text.slice(1)
    }

    const lastDot = text.lastIndexOf('.')
    const lastComma = text.lastIndexOf(',')

    let decimal: string | null = null

    if (lastDot >= 0 && lastComma >= 0) {
        decimal = lastDot > lastComma ? '.' : ','
    } else if (lastDot >= 0 || lastComma >= 0) {
        const separator = lastDot >= 0 ? '.' : ','
        const isSingle = text.indexOf(separator) == text.lastIndexOf(separator)

        decimal = isSingle && !isGrouping(text, separator) ? separator : null
    }

    let normalized = text.replace(decimal == '.' ? /,/g : decimal == ',' ? /\./g : /[.,]/g, '')

    if (decimal == ',')
        normalized = normalized.replace(',', '.')

    return NUMBER_PATTERN.test(normalized) ? sign * Number(normalized) : NaN
}

export function sum<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => acc + selector(value), 0)
}

export function maxOf<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => Math.max(acc, selector(value)), 0)
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

let shortFormat: Intl.NumberFormat | undefined

export function short(value: any, isShort: boolean) {
    if (!isShort) {
        return String(value ?? '')
    }

    shortFormat ??= new Intl.NumberFormat(undefined, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    })

    return shortFormat.format(parseNumber(value))
}