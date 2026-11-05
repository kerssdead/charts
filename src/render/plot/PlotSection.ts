import { PlotOrientation, PlotScaleType } from '@/static/Enums'
import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import PlotValueScale from '@/render/plot/PlotValueScale'
import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { Slots } from '@/render/plot/PlotSlots'

export type Band = {
    top: number
    bottom: number
}

export default class PlotSection {
    readonly band: Band

    readonly categoryScale: PlotCategoryScale

    readonly valueScale: PlotValueScale

    readonly baseline: number

    constructor(
        orientation: PlotOrientation,
        slots: Slots,
        axisValues: number[],
        band: Band,
        left: number,
        width: number,
        continuousAxis: PlotContinuousAxis | null = null,
        valueScaleType = PlotScaleType.Linear
    ) {
        const height = band.bottom - band.top

        this.band = band

        if (orientation == PlotOrientation.Vertical) {
            this.categoryScale = PlotCategoryScale.fromLeft(slots, left, width, continuousAxis)
            this.valueScale = PlotValueScale.fromBottom(axisValues, band.bottom, height, valueScaleType)
        } else {
            this.categoryScale = PlotCategoryScale.fromBottom(slots, band.bottom, height, continuousAxis)
            this.valueScale = PlotValueScale.fromLeft(axisValues, left, width, valueScaleType)
        }

        this.baseline = this.valueScale.baseline
    }
}