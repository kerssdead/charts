import PlotPoint from '@/types/PlotPoint'

export default interface PlotSlotLayout {
    readonly step: number

    readonly gap: number

    readonly labelValues: PlotPoint['x'][]

    readonly minLabelDistance: number

    getLabelCoordinate(index: number): number

    getSlotStart(slot: number): number

    getSlotCenter(slot: number): number
}