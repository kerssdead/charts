import Paddings from '@/types/Paddings'
import Units from '@/helpers/Units'
import { maxOf } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'
import {
    AXIS_LABEL_FONT,
    AXIS_TITLE_FONT,
    BOTTOM_GAP,
    BOTTOM_PADDING,
    LEFT_GAP,
    LEFT_PADDING,
    RIGHT_MARGIN,
    SIMPLE_MARGIN,
    TOP_MARGIN,
    X_LABEL_HEIGHT
} from '@/render/plot/PlotConstants'

export function getMargin(
    units: Units,
    isSimple: boolean,
    leftTitle: string,
    bottomTitle: string,
    leftLabels: string[]
): Paddings {
    return isSimple
           ? { top: SIMPLE_MARGIN, right: SIMPLE_MARGIN, bottom: SIMPLE_MARGIN, left: SIMPLE_MARGIN }
           : {
               top: TOP_MARGIN,
               right: RIGHT_MARGIN,
               bottom: getBottomMargin(units, bottomTitle),
               left: getLeftMargin(units, leftTitle, leftLabels)
           }
}

function getLeftMargin(units: Units, leftTitle: string, leftLabels: string[]) {
    const titleWidth = leftTitle ? AXIS_TITLE_FONT + LEFT_GAP : 0
    const labelsWidth = maxOf(leftLabels, label => stringWidth(label, AXIS_LABEL_FONT))

    return units.x(LEFT_PADDING + titleWidth + labelsWidth + LEFT_GAP)
}

function getBottomMargin(units: Units, bottomTitle: string) {
    const titleHeight = bottomTitle ? BOTTOM_GAP + AXIS_TITLE_FONT : 0

    return units.y(X_LABEL_HEIGHT + titleHeight + BOTTOM_PADDING)
}