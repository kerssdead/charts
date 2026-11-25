import { sampleField } from '@/helpers/FieldSampling'

const field = (columns: number, rows: number, values: number[]) => {
    return { columns, rows, values: Float32Array.from(values) }
}

const SQUARE = field(2, 2, [0, 10, 20, 30])

describe('Sampling a field', () => {
    it('Should give the node value at a node center', () => {
        expect(sampleField(SQUARE, .25, .25))
            .toBe(0)
        expect(sampleField(SQUARE, .75, .25))
            .toBe(10)
        expect(sampleField(SQUARE, .25, .75))
            .toBe(20)
        expect(sampleField(SQUARE, .75, .75))
            .toBe(30)
    })

    it('Should give the average at the middle of four nodes', () => {
        expect(sampleField(SQUARE, .5, .5))
            .toBeCloseTo(15)
    })

    it('Should ease between nodes', () => {
        expect(sampleField(SQUARE, .375, .25))
            .toBeCloseTo(10 * .15625)
    })

    it('Should hold the edge values outside the node centers', () => {
        expect(sampleField(SQUARE, 0, 0))
            .toBe(0)
        expect(sampleField(SQUARE, 1, 1))
            .toBe(30)
        expect(sampleField(SQUARE, -5, 5))
            .toBe(20)
    })

    it('Should give the only value of a single node field', () => {
        expect(sampleField(field(1, 1, [7]), .3, .9))
            .toBe(7)
    })

    it('Should use the nearest node when the field has a single row', () => {
        expect(sampleField(field(3, 1, [1, 2, 3]), .9, .5))
            .toBe(3)
    })
})