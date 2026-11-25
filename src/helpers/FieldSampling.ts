import { clamp, smoothstep } from '@/helpers/Geometry'

type Samples = {
    values: Float32Array
    columns: number
    rows: number
}

export function sampleField({ values, columns, rows }: Samples, u: number, v: number) {
    const x = Math.min(Math.max(u * columns - .5, 0), columns - 1)
    const y = Math.min(Math.max(v * rows - .5, 0), rows - 1)

    const column = Math.min(Math.floor(x), columns - 2)
    const row = Math.min(Math.floor(y), rows - 2)

    if (column < 0 || row < 0)
        return values[Math.round(y) * columns + Math.round(x)]

    const tx = smoothstep(x - column)
    const ty = smoothstep(y - row)
    const index = row * columns + column

    const top = values[index] + (values[index + 1] - values[index]) * tx
    const bottom = values[index + columns] + (values[index + columns + 1] - values[index + columns]) * tx

    return top + (bottom - top) * ty
}

type Levels = Samples & {
    min: number
    max: number
}

type Axis = {
    first: Int32Array
    second: Int32Array
    weight: Float32Array
}

export function sampleLevels(field: Levels, width: number, height: number, levelCount: number) {
    const { min, max } = field
    const levels = new Uint8Array(width * height)
    const last = levelCount - 1
    const span = max - min

    if (!(span > 0))
        return levels.fill(last)

    const scale = last / span
    const vertical = getAxis(height, field.rows)
    const fieldRows = new FieldRowSampler(field, width)

    for (let row = 0; row < height; row++) {
        const upper = fieldRows.get(vertical.first[row])
        const lower = fieldRows.get(vertical.second[row])
        const ty = vertical.weight[row]
        const offset = row * width

        for (let column = 0; column < width; column++) {
            const level = (upper[column] + (lower[column] - upper[column]) * ty - min) * scale

            levels[offset + column] = clamp(level + .5, 0, last)
        }
    }

    return levels
}

class FieldRowSampler {
    private readonly field: Samples

    private readonly width: number

    private readonly horizontal: Axis

    private readonly rows: Float32Array[] = []

    constructor(field: Samples, width: number) {
        this.field = field
        this.width = width
        this.horizontal = getAxis(width, field.columns)
    }

    get(fieldRow: number) {
        return this.rows[fieldRow] ??= this.sample(fieldRow)
    }

    private sample(fieldRow: number) {
        const { values, columns } = this.field
        const { first, second, weight } = this.horizontal
        const offset = fieldRow * columns
        const result = new Float32Array(this.width)

        for (let column = 0; column < this.width; column++) {
            const left = values[offset + first[column]]

            result[column] = left + (values[offset + second[column]] - left) * weight[column]
        }

        return result
    }
}

function getAxis(size: number, nodes: number): Axis {
    const axis = { first: new Int32Array(size), second: new Int32Array(size), weight: new Float32Array(size) }

    for (let index = 0; index < size; index++) {
        const position = Math.min(Math.max((index + .5) / size * nodes - .5, 0), nodes - 1)
        const first = Math.floor(position)

        axis.first[index] = first
        axis.second[index] = Math.min(first + 1, nodes - 1)
        axis.weight[index] = smoothstep(position - first)
    }

    return axis
}