import Color from '@/types/Color'
import { clamp, lerp } from '@/helpers/Geometry'
import { scratchContext } from '@/helpers/Text'
import Palette from '@/static/constants/Palette'

const RESET_COLOR = '#000000'

const BLACK = '#000000'

const WHITE = '#ffffff'

const BLACK_LUMINANCE = 0

const WHITE_LUMINANCE = 1

const CONTRAST_FLARE = .05

const PALETTE_ROUND_SHIFT = 40

const CSS_VARIABLE = /^(?:var\(\s*)?(--[\w-]+)\s*(?:,\s*([^)]+))?\)?$/

export function adjustColor(color: string, amount: number) {
    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    return '#' + [rgb.r, rgb.g, rgb.b].map(channel => toHex(channel + amount)).join('')
}

export function spreadColor(base: string, index: number, count: number, range: number) {
    const rgb = hexToRgb(base)

    if (count === 1 || !rgb)
        return base

    const min = Math.min(rgb.r, rgb.g, rgb.b)
    const max = Math.max(rgb.r, rgb.g, rgb.b)
    const shift = Math.max(0, range - min) - Math.max(0, range - (255 - max))

    return adjustColor(base, Math.round((index / (count - 1) * 2 - 1) * range) + shift) + expandHex(base).slice(7)
}

function toHex(channel: number) {
    return Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0')
}

export function normalizeColor(color: string, scope?: Element) {
    color = resolveVariable(color, scope)

    if (color.startsWith('#')) {
        const hex = expandHex(color)

        if (getHexValues(hex))
            return hex
    }

    const ctx = scratchContext()

    ctx.fillStyle = RESET_COLOR
    ctx.fillStyle = color

    const style = String(ctx.fillStyle)
    const rgba = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(style)

    if (!rgba)
        return style.startsWith('#') ? style : readPixel(ctx)

    const alpha = rgba[4] === undefined ? '' : toHex(+rgba[4] * 255)

    return '#' + toHex(+rgba[1]) + toHex(+rgba[2]) + toHex(+rgba[3]) + alpha
}

function resolveVariable(color: string, scope?: Element) {
    const match = CSS_VARIABLE.exec(color.trim())

    if (!match)
        return color

    const [, name, fallback] = match
    const value = getComputedStyle(scope ?? document.documentElement).getPropertyValue(name).trim()

    return value || fallback?.trim() || color
}

function readPixel(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillRect(0, 0, 1, 1)

    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data

    return '#' + toHex(r) + toHex(g) + toHex(b) + (a === 255 ? '' : toHex(a))
}

export function grayScale(color: string, amount: number = 1) {
    if (amount <= 0)
        return color

    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    const gray = .3 * rgb.r + .59 * rgb.g + .11 * rgb.b

    const grayChannels = [rgb.r, rgb.g, rgb.b].map(channel => lerp(channel, gray, amount))
    const alpha = expandHex(color).slice(7)

    return '#' + grayChannels.map(toHex).join('') + alpha
}

export function paletteColor(index: number) {
    const round = Math.floor(index / Palette.length)
    const shift = Math.ceil(round / 2) * PALETTE_ROUND_SHIFT * (round % 2 ? -1 : 1)

    return adjustColor(Palette[index % Palette.length], shift)
}

export function contrastTextColor(background: string) {
    const value = luminance(background)

    return contrastRatio(value, BLACK_LUMINANCE) > contrastRatio(WHITE_LUMINANCE, value) ? BLACK : WHITE
}

function contrastRatio(lighter: number, darker: number) {
    return (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE)
}

export function luminance(color: string) {
    const { r, g, b } = hexToRgb(color) ?? { r: 0, g: 0, b: 0 }

    const channel = (value: number) => {
        const c = value / 255

        return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
    }

    return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b)
}

export function hexToRgb(hex: string): Color | null {
    const value = getHexValues(expandHex(hex))

    if (!value)
        return null

    return { r: parseInt(value[1], 16), g: parseInt(value[2], 16), b: parseInt(value[3], 16) }
}

function getHexValues(str: string) {
    return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str)
}

function expandHex(str: string) {
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i.exec(str)

    return short ? '#' + short.slice(1).filter(Boolean).map(value => value + value).join('') : str
}

export function withAlpha(color: string, alpha: number) {
    const value = Math.round(clamp(alpha, 0, 1) * 255)

    return color.slice(0, 7) + value.toString(16).padStart(2, '0')
}