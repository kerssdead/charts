import { sampleField, sampleLevels } from '@/helpers/FieldSampling'

const field = (columns: number, rows: number, values: number[], range = { min: 0, max: 100 }) => {
    return { columns, rows, values: Float32Array.from(values), ...range }
}

describe('Sampling field levels', () => {
    it('Should give one level for each pixel', () => {
        expect(sampleLevels(field(2, 2, [0, 1, 2, 3]), 7, 5, 256))
            .toHaveLength(35)
    })

    it('Should map the value range to the level range', () => {
        expect([...sampleLevels(field(2, 1, [0, 100]), 2, 1, 256)])
            .toEqual([0, 255])
    })

    it('Should clamp values outside the range', () => {
        expect([...sampleLevels(field(2, 1, [-50, 200]), 2, 1, 256)])
            .toEqual([0, 255])
    })

    it('Should use the given number of levels', () => {
        expect([...sampleLevels(field(2, 1, [0, 100]), 2, 1, 11)])
            .toEqual([0, 10])
    })

    it('Should give the highest level for a flat range', () => {
        expect([...sampleLevels(field(2, 1, [5, 5], { min: 5, max: 5 }), 3, 1, 256)])
            .toEqual([255, 255, 255])
    })

    it('Should match sampling every pixel on its own', () => {
        const source = field(4, 3, [0, 20, 40, 60, 80, 100, 10, 30, 50, 70, 90, 5])
        const levels = sampleLevels(source, 9, 6, 256)

        for (let row = 0; row < 6; row++)
            for (let column = 0; column < 9; column++) {
                const value = sampleField(source, (column + .5) / 9, (row + .5) / 6)

                expect(Math.abs(levels[row * 9 + column] - value / 100 * 255))
                    .toBeLessThanOrEqual(.5001)
            }
    })

    it('Should match sampling every pixel on its own when the field is larger than the image', () => {
        const values = Array.from({ length: 48 }, (_, index) => (index * 37) % 100)
        const source = field(8, 6, values)
        const levels = sampleLevels(source, 3, 2, 256)

        for (let row = 0; row < 2; row++)
            for (let column = 0; column < 3; column++) {
                const value = sampleField(source, (column + .5) / 3, (row + .5) / 2)

                expect(Math.abs(levels[row * 3 + column] - value / 100 * 255))
                    .toBeLessThanOrEqual(.5001)
            }
    })

    it('Should interpolate along a single row', () => {
        const levels = sampleLevels(field(2, 1, [0, 100]), 4, 1, 256)

        expect(levels[1])
            .toBeGreaterThan(levels[0])
        expect(levels[2])
            .toBeGreaterThan(levels[1])
    })
})