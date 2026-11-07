import { PlotScaleType } from '@/static/Enums'
import { fromScaleUnits, toScaleUnits } from '@/render/plot/PlotScaleUnits'

type Range = {
    min: number
    max: number
}

export default class PlotValueScale {
    readonly values: number[]

    readonly baseline: number

    private readonly start: number

    private readonly length: number

    private readonly direction: number

    private readonly isLog: boolean

    private readonly range: Range | null

    private constructor(
        values: number[],
        start: number,
        length: number,
        direction: number,
        scaleType: PlotScaleType
    ) {
        this.values = values
        this.start = start
        this.length = length
        this.direction = direction
        this.isLog = scaleType == PlotScaleType.Log
        this.range = values.length < 2
                     ? null
                     : {
                         min: toScaleUnits(values[0], this.isLog),
                         max: toScaleUnits(values[values.length - 1], this.isLog)
                     }

        this.baseline = this.isLog ? start : this.getCoordinate(0)
    }

    static fromBottom(values: number[], bottom: number, height: number, scaleType = PlotScaleType.Linear) {
        return new PlotValueScale(values, bottom, height, -1, scaleType)
    }

    static fromLeft(values: number[], left: number, width: number, scaleType = PlotScaleType.Linear) {
        return new PlotValueScale(values, left, width, 1, scaleType)
    }

    canShow(value: number | null): value is number {
        return value != null && (!this.isLog || value > 0)
    }

    getCoordinate(value: number) {
        const range = this.range

        if (!range || range.max == range.min)
            return this.start

        const units = toScaleUnits(value, this.isLog)

        return this.start + this.direction * (units - range.min) / (range.max - range.min) * this.length
    }

    getValue(coordinate: number) {
        const range = this.range

        if (!range || this.length == 0)
            return 0

        const ratio = this.direction * (coordinate - this.start) / this.length
        const units = range.min + ratio * (range.max - range.min)

        return fromScaleUnits(units, this.isLog)
    }
}