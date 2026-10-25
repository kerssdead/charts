type Range = {
    min: number
    max: number
}

export default class PlotValueScale {
    readonly values: number[]

    readonly lengthPerUnit: number

    private readonly start: number

    private readonly length: number

    private readonly direction: number

    private readonly range: Range | null

    private constructor(values: number[], start: number, length: number, direction: number) {
        this.values = values
        this.start = start
        this.length = length
        this.direction = direction
        const range = values.length < 2 ? null : { min: values[0], max: values[values.length - 1] }

        this.range = range
        this.lengthPerUnit = !range || range.max == range.min ? 0 : length / (range.max - range.min)
    }

    static fromBottom(values: number[], bottom: number, height: number) {
        return new PlotValueScale(values, bottom, height, -1)
    }

    static fromLeft(values: number[], left: number, width: number) {
        return new PlotValueScale(values, left, width, 1)
    }

    getCoordinate(value: number) {
        const range = this.range

        return !range || range.max == range.min
               ? this.start
               : this.start + this.direction * (value - range.min) / (range.max - range.min) * this.length
    }

    getValue(coordinate: number) {
        const range = this.range

        if (!range || this.length == 0)
            return 0

        return range.min + this.direction * (coordinate - this.start) / this.length * (range.max - range.min)
    }
}