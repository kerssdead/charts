import PlotPoint from '@/types/PlotPoint'
import { Slots } from '@/render/plot/PlotSlots'
import PlotSlotLayout from '@/render/plot/PlotSlotLayout'
import PlotEvenSlotLayout from '@/render/plot/PlotEvenSlotLayout'
import PlotContinuousSlotLayout from '@/render/plot/PlotContinuousSlotLayout'
import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import fail from '@/helpers/Errors'
import { ErrorType } from '@/static/Enums'

export default class PlotCategoryScale {
    readonly slots: Slots

    readonly isContinuous: boolean

    private readonly layout: PlotSlotLayout

    private constructor(
        slots: Slots,
        start: number,
        length: number,
        direction: number,
        continuousAxis: PlotContinuousAxis | null
    ) {
        this.slots = slots
        this.isContinuous = continuousAxis != null
        this.layout = continuousAxis
                      ? new PlotContinuousSlotLayout(continuousAxis, start, length, direction)
                      : new PlotEvenSlotLayout(slots, start, length, direction)
    }

    static fromBottom(
        slots: Slots,
        bottom: number,
        height: number,
        continuousAxis: PlotContinuousAxis | null = null
    ) {
        return new PlotCategoryScale(slots, bottom, height, -1, continuousAxis)
    }

    static fromLeft(slots: Slots, left: number, width: number, continuousAxis: PlotContinuousAxis | null = null) {
        return new PlotCategoryScale(slots, left, width, 1, continuousAxis)
    }

    get count() {
        return this.slots.values.length
    }

    get step() {
        return this.layout.step
    }

    get gap() {
        return this.layout.gap
    }

    get labelValues() {
        return this.layout.labelValues
    }

    get minLabelDistance() {
        return this.layout.minLabelDistance
    }

    getLabelCoordinate(index: number) {
        return this.layout.getLabelCoordinate(index)
    }

    getSlot(value: PlotPoint) {
        return this.slots.index.get(value.x.toString()) ?? fail(ErrorType.UnknownPlotSlot)
    }

    getSlotStart(slot: number) {
        return this.layout.getSlotStart(slot)
    }

    getSlotCenter(slot: number) {
        return this.layout.getSlotCenter(slot)
    }
}