import HeatMapData from '@/types/data/HeatMapData'
import { blendColors, withAlpha } from '@/helpers/Color'
import { packColor } from '@/helpers/PackedColor'
import { clamp, lerp } from '@/helpers/Geometry'
import {
    ALPHA_FADE_RATIO,
    DEFAULT_OPACITY,
    LUT_SIZE,
    MIN_RAMP_STRENGTH
} from '@/render/heatMap/HeatMapConstants'

export type Ramp = (ratio: number) => string

export function createRamp(data: HeatMapData, canvasBackground: string): Ramp {
    const opacity = clamp(data.opacity ?? DEFAULT_OPACITY, 0, 1)
    const { colors } = data

    if (colors?.length)
        return ratio => {
            const color = getStopColor(colors, ratio)

            return data.image ? withAlpha(color, opacity * clamp(ratio / ALPHA_FADE_RATIO, 0, 1)) : color
        }

    return ratio => {
        const strength = lerp(MIN_RAMP_STRENGTH, 1, ratio)

        return data.image
               ? withAlpha(data.color, strength * opacity)
               : blendColors(canvasBackground, data.color, strength)
    }
}

export function createColors(ramp: Ramp) {
    return Array.from({ length: LUT_SIZE }, (_, index) => ramp(index / (LUT_SIZE - 1)))
}

export function createLut(colors: string[]) {
    return Uint32Array.from(colors, packColor)
}

function getStopColor(colors: string[], ratio: number) {
    const position = clamp(ratio, 0, 1) * (colors.length - 1)
    const index = Math.min(Math.floor(position), colors.length - 2)

    return index < 0 ? colors[0] : blendColors(colors[index], colors[index + 1], position - index)
}