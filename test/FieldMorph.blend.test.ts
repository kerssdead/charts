import FieldMorph from '@/helpers/FieldMorph'
import FieldRenderData from '@/types/FieldRenderData'

const field = (values: number[], min: number, max: number) => {
    const lut = new Uint32Array(1)

    return { columns: values.length, rows: 1, values: Float32Array.from(values), min, max, lut } as FieldRenderData
}

const morphed = () => {
    const morph = new FieldMorph()
    const next = field([100, 0], 20, 200)

    morph.capture(new FieldMorph(), field([0, 100], 0, 100), 1, next)

    return { morph, next }
}

describe('Blending the field during a morph', () => {
    it('Should give the previous values at the start', () => {
        const { morph, next } = morphed()

        expect([...morph.blend(next, 0).values])
            .toEqual([0, 100])
    })

    it('Should give the next values at the end', () => {
        const { morph, next } = morphed()

        expect([...morph.blend(next, 1).values])
            .toEqual([100, 0])
    })

    it('Should blend values and range in between', () => {
        const { morph, next } = morphed()
        const blended = morph.blend(next, .5)

        expect([...blended.values])
            .toEqual([50, 50])
        expect(blended.min)
            .toBe(10)
        expect(blended.max)
            .toBe(150)
    })

    it('Should keep the other field settings', () => {
        const { morph, next } = morphed()

        expect(morph.blend(next, .5).lut)
            .toBe(next.lut)
    })

    it('Should not change the next field', () => {
        const { morph, next } = morphed()

        morph.blend(next, .5)

        expect([...next.values])
            .toEqual([100, 0])
    })
})