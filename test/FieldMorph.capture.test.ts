import FieldMorph from '@/helpers/FieldMorph'
import FieldRenderData from '@/types/FieldRenderData'

const field = (columns: number, rows: number, values: number[], range = { min: 0, max: 10 }) => {
    const lut = new Uint32Array(1)

    return { columns, rows, values: Float32Array.from(values), ...range, lut } as FieldRenderData
}

describe('Capturing the field to morph from', () => {
    it('Should have no source before capturing', () => {
        expect(new FieldMorph().hasSource)
            .toBe(false)
    })

    it('Should have a source after capturing', () => {
        const morph = new FieldMorph()

        morph.capture(new FieldMorph(), field(2, 1, [1, 2]), 1, field(2, 1, [5, 6]))

        expect(morph.hasSource)
            .toBe(true)
    })

    it('Should start the blend from the previous field', () => {
        const morph = new FieldMorph()
        const next = field(2, 1, [100, 100], { min: 0, max: 20 })

        morph.capture(new FieldMorph(), field(2, 1, [0, 10], { min: 0, max: 10 }), 1, next)

        expect([...morph.blend(next, 0).values])
            .toEqual([0, 10])
    })

    it('Should resample the previous field onto the next grid', () => {
        const morph = new FieldMorph()
        const next = field(4, 2, [0, 0, 0, 0, 0, 0, 0, 0])

        morph.capture(new FieldMorph(), field(2, 2, [0, 10, 0, 10]), 1, next)

        const start = morph.blend(next, 0).values

        expect(start[0])
            .toBe(0)
        expect(start[3])
            .toBe(10)
        expect(start[1])
            .toBeGreaterThan(start[0])
        expect(start[2])
            .toBeGreaterThan(start[1])
    })

    it('Should continue from the picture shown in the middle of an earlier morph', () => {
        const first = new FieldMorph()
        const middle = field(2, 1, [100, 100], { min: 0, max: 100 })

        first.capture(new FieldMorph(), field(2, 1, [0, 0], { min: 0, max: 0 }), 1, middle)

        const second = new FieldMorph()
        const last = field(2, 1, [0, 0], { min: 0, max: 100 })

        second.capture(first, middle, .5, last)

        expect([...second.blend(last, 0).values])
            .toEqual([50, 50])
    })
})