import Units from '@/helpers/Units'
import RectangleDimensions from '@/types/RectangleDimensions'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { stringWidth } from '@/helpers/Text'
import {
    LABEL_FONT_SIZE,
    LABEL_GAP,
    LABEL_MAX_SHARE,
    PADDING_X,
    PADDING_Y,
    STOP_OVERFLOW
} from '@/render/segmentedBar/SegmentedBarConstants'

export function getLabelSpace(units: Units, text: string | undefined) {
    if (!text)
        return 0

    return Math.min(units.x(stringWidth(text, LABEL_FONT_SIZE)), COORDS_MAX_X * LABEL_MAX_SHARE) + units.x(LABEL_GAP)
}

export function getBarBox(
    units: Units,
    leftLabel: string | undefined,
    rightLabel: string | undefined
): RectangleDimensions {
    const padding = units.x(PADDING_X)
    const left = padding + getLabelSpace(units, leftLabel)
    const right = padding + getLabelSpace(units, rightLabel)
    const top = units.y(PADDING_Y + STOP_OVERFLOW)

    return {
        x: left,
        y: top,
        width: COORDS_MAX_X - left - right,
        height: COORDS_MAX_Y - top * 2
    }
}