import PlotSlotLayout from '@/render/plot/PlotSlotLayout'
import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { MAX_SLOT_GAP, SLOT_GAP_RATIO } from '@/render/plot/PlotConstants'

export default class PlotContinuousSlotLayout implements PlotSlotLayout {
    readonly step: number

    readonly gap: number

    private readonly axis: PlotContinuousAxis

    private readonly start: number

    private readonly length: number

    private readonly direction: number

    private readonly padding: number

    constructor(axis: PlotContinuousAxis, start: number, length: number, direction: number) {
        const distance = axis.minSlotDistance
        const spacing = distance * length / (1 + distance)

        this.axis = axis
        this.start = start
        this.length = length
        this.direction = direction
        this.gap = Math.min(MAX_SLOT_GAP, spacing * SLOT_GAP_RATIO)
        this.step = spacing - this.gap
        this.padding = spacing / 2
    }

    get labelValues() {
        return this.axis.ticks
    }

    get minLabelDistance() {
        const ticks = this.axis.ticks

        return ticks.slice(1).reduce(
            (min, tick, i) => Math.min(min, Math.abs(this.getCoordinate(tick) - this.getCoordinate(ticks[i]))),
            this.length
        )
    }

    getLabelCoordinate(index: number) {
        return this.getCoordinate(this.axis.ticks[index])
    }

    getSlotStart(slot: number) {
        return this.getSlotCenter(slot) - this.direction * this.step / 2
    }

    getSlotCenter(slot: number) {
        return this.getCoordinate(this.axis.slotValues[slot])
    }

    private getCoordinate(x: number) {
        const ratio = this.axis.getRatio(x)

        return this.start + this.direction * (this.padding + ratio * (this.length - 2 * this.padding))
    }
}