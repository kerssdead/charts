import PlotSlotLayout from '@/render/plot/PlotSlotLayout'
import { getGap, Slots } from '@/render/plot/PlotSlots'

export default class PlotEvenSlotLayout implements PlotSlotLayout {
    readonly step: number

    readonly gap: number

    constructor(
        private readonly slots: Slots,
        private readonly start: number,
        length: number,
        private readonly direction: number
    ) {
        this.gap = getGap(length, slots.values.length)
        this.step = (length - this.gap) / slots.values.length - this.gap
    }

    get labelValues() {
        return this.slots.values
    }

    get minLabelDistance() {
        return this.step + this.gap
    }

    getLabelCoordinate(index: number) {
        return this.getSlotCenter(index)
    }

    getSlotStart(slot: number) {
        return this.start + this.direction * slot * this.step + this.direction * (slot + 1) * this.gap
    }

    getSlotCenter(slot: number) {
        return this.getSlotStart(slot) + this.direction * this.step / 2
    }
}