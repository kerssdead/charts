import { lerp } from '@/helpers/Geometry'
import { hexToRgb } from '@/helpers/Color'

const ALPHA_SHIFT = 24

const COLOR_MASK = 0x00ffffff

const CHANNEL_MASK = 0xff

const CHANNEL_SHIFTS = [0, 8, 16, 24]

export function packColor(color: string) {
    const { r, g, b } = hexToRgb(color) ?? { r: 0, g: 0, b: 0 }
    const alpha = color.length > 7 ? parseInt(color.slice(7, 9), 16) : CHANNEL_MASK

    return new Uint32Array(new Uint8ClampedArray([r, g, b, alpha]).buffer)[0]
}

export function getPackedAlpha(color: number) {
    return color >>> ALPHA_SHIFT
}

export function scalePackedAlpha(color: number, factor: number) {
    return ((color & COLOR_MASK) | (Math.round(getPackedAlpha(color) * factor) << ALPHA_SHIFT)) >>> 0
}

export function blendPacked(from: number, to: number, progress: number) {
    const start = getPackedAlpha(from) === 0 ? to & COLOR_MASK : from
    const end = getPackedAlpha(to) === 0 ? from & COLOR_MASK : to

    let result = 0

    for (const shift of CHANNEL_SHIFTS) {
        const startChannel = (start >>> shift) & CHANNEL_MASK
        const endChannel = (end >>> shift) & CHANNEL_MASK

        result |= Math.round(lerp(startChannel, endChannel, progress)) << shift
    }

    return result >>> 0
}