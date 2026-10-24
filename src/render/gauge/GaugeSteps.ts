import { stringWidth } from '@/helpers/Text'
import { RANGE_FONT_SIZE, START_ANGLE, STEP_DIVISIONS, SWEEP_ANGLE } from '@/render/gauge/GaugeConstants'

export type GaugeStep = {
    angle: number
    text: string
    textWidth: number
}

export function getSteps(min: number, max: number, formatValue: (value: number) => string): GaugeStep[] {
    return Array.from({ length: STEP_DIVISIONS - 1 }, (_, index) => {
        const ratio = (index + 1) / STEP_DIVISIONS
        const text = formatValue(min + (max - min) * ratio)

        return { angle: START_ANGLE + SWEEP_ANGLE * ratio, text, textWidth: stringWidth(text, RANGE_FONT_SIZE) }
    })
}