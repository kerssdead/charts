import FieldRenderData from '@/types/FieldRenderData'
import { sampleField } from '@/helpers/FieldSampling'
import { lerp } from '@/helpers/Geometry'

type Snapshot = {
    values: Float32Array
    min: number
    max: number
}

export default class FieldMorph {
    private from: Snapshot | null = null

    get hasSource() {
        return this.from !== null
    }

    capture(previous: FieldMorph, previousField: FieldRenderData, progress: number, next: FieldRenderData) {
        const { columns, rows } = next
        const values = new Float32Array(columns * rows)

        for (let row = 0; row < rows; row++)
            for (let column = 0; column < columns; column++)
                values[row * columns + column] = previous.getValueAt(
                    previousField,
                    { u: (column + .5) / columns, v: (row + .5) / rows },
                    progress
                )

        this.from = { values, ...previous.getRange(previousField, progress) }
    }

    blend(field: FieldRenderData, progress: number): FieldRenderData {
        const from = this.from as Snapshot

        return {
            ...field,
            values: field.values.map((value, index) => lerp(from.values[index], value, progress)),
            min: lerp(from.min, field.min, progress),
            max: lerp(from.max, field.max, progress)
        }
    }

    private getValueAt(field: FieldRenderData, { u, v }: { u: number, v: number }, progress: number) {
        const to = sampleField(field, u, v)

        if (!this.from || progress >= 1)
            return to

        return lerp(sampleField({ ...field, values: this.from.values }, u, v), to, progress)
    }

    private getRange(field: FieldRenderData, progress: number) {
        if (!this.from || progress >= 1)
            return { min: field.min, max: field.max }

        return { min: lerp(this.from.min, field.min, progress), max: lerp(this.from.max, field.max, progress) }
    }
}