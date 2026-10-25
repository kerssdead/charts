import PlotPoint from '@/types/PlotPoint'
import { getGap, Slots } from '@/render/plot/PlotSlots'

export default class PlotCategoryScale {
    readonly slots: Slots

    readonly step: number

    readonly gap: number

    private readonly start: number

    private readonly direction: number

    private constructor(slots: Slots, start: number, length: number, direction: number) {
        this.slots = slots
        this.start = start
        this.direction = direction
        this.gap = getGap(length, slots.values.length)
        this.step = (length - this.gap) / slots.values.length - this.gap
    }

    static fromBottom(slots: Slots, bottom: number, height: number) {
        return new PlotCategoryScale(slots, bottom, height, -1)
    }

    static fromLeft(slots: Slots, left: number, width: number) {
        return new PlotCategoryScale(slots, left, width, 1)
    }

    get count() {
        return this.slots.values.length
    }

    getSlot(value: PlotPoint) {
        return this.slots.index.get(value.x.toString()) ?? 0
    }

    getSlotStart(slot: number) {
        return this.start + this.direction * slot * this.step + this.direction * (slot + 1) * this.gap
    }

    getSlotCenter(slot: number) {
        return this.getSlotStart(slot) + this.direction * this.step / 2
    }
}