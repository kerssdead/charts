import { PlotOrientation } from '@/static/Enums'
import PlotCategoryScale from '@/render/plot/PlotCategoryScale'
import PlotValueScale from '@/render/plot/PlotValueScale'
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
        width: number
    ) {
        const height = band.bottom - band.top

        this.band = band

        if (orientation == PlotOrientation.Vertical) {
            this.categoryScale = PlotCategoryScale.fromLeft(slots, left, width)
            this.valueScale = PlotValueScale.fromBottom(axisValues, band.bottom, height)
        } else {
            this.categoryScale = PlotCategoryScale.fromBottom(slots, band.bottom, height)
            this.valueScale = PlotValueScale.fromLeft(axisValues, left, width)
        }

        this.baseline = this.valueScale.getCoordinate(0)
    }
}