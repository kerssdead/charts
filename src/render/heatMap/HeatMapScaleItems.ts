import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import { AnimationTiming } from '@/static/constants/Index'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import {
    AXIS_FONT,
    LABEL_GAP,
    PADDING,
    SCALE_BAR_HEIGHT,
    SCALE_HEIGHT,
    SCALE_SAMPLES,
    SCALE_WIDTH
} from '@/render/heatMap/HeatMapConstants'

export type ScaleFrame = {
    units: Units
    area: RectangleDimensions
    height: number
    minText: string
    maxText: string
    lut: Uint32Array
}

export function getScaleAction({ units, area, height, minText, maxText, lut }: ScaleFrame) {
    const width = Math.min(area.width, SCALE_WIDTH)
    const top = height - PADDING - SCALE_HEIGHT
    const values = Float32Array.from({ length: SCALE_SAMPLES }, (_, index) => index / (SCALE_SAMPLES - 1))

    return (items: QueueItemsBuilder) => {
        items.field()
             .box(units.x(area.x), units.y(top), units.x(width), units.y(SCALE_BAR_HEIGHT))
             .field({ columns: SCALE_SAMPLES, rows: 1, values, min: 0, max: 1, lut })
             .init(AnimationTiming.heatMapInit, 0, true)
             .key('heat-scale')

        items.text(minText)
             .position(units.x(area.x), units.y(top + SCALE_BAR_HEIGHT + LABEL_GAP))
             .align(TextAlignment.Left)
             .baseline(TextBaseline.Top)
             .size(AXIS_FONT)
             .key('heat-scale-min')

        items.text(maxText)
             .position(units.x(area.x + width), units.y(top + SCALE_BAR_HEIGHT + LABEL_GAP))
             .align(TextAlignment.Right)
             .baseline(TextBaseline.Top)
             .size(AXIS_FONT)
             .key('heat-scale-max')
    }
}