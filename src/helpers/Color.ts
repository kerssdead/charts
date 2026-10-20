import Color from '@/types/Color'
import { clamp } from '@/helpers/Geometry'
import { scratchContext } from '@/helpers/Text'

const RESET_COLOR = '#000000'

export function adjustColor(color: string, amount: number) {
    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    return '#' + [rgb.r, rgb.g, rgb.b].map(channel => toHex(channel + amount)).join('')
}

export function spreadColor(base: string, index: number, count: number, range: number) {
    const ratio = count == 1 ? .5 : index / (count - 1)

    return adjustColor(base, Math.round((ratio * 2 - 1) * range))
}

function toHex(channel: number) {
    return Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0')
}

export function normalizeColor(color: string) {
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

    return '#' + toHex(+rgba[1]) + toHex(+rgba[2]) + toHex(+rgba[3]) + (rgba[4] == undefined ? '' : toHex(+rgba[4] * 255))
}

function readPixel(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillRect(0, 0, 1, 1)

    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data

    return '#' + toHex(r) + toHex(g) + toHex(b) + (a == 255 ? '' : toHex(a))
}

export function grayScale(color: string) {
    const rgb = hexToRgb(color)

    if (!rgb)
        return color

    return '#' + toHex(.3 * rgb.r + .59 * rgb.g + .11 * rgb.b).repeat(3)
}

export function randomColor() {
    return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0')
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