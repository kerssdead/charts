import { getValueRange } from '@/render/heatMap/HeatMapGrid'

const cell = (value: number) => ({ column: 0, row: 0, value })

describe('Getting the value range of cells', () => {
    it('Should give the lowest and highest value', () => {
        expect(getValueRange([cell(5), cell(-2), cell(9), cell(3)]))
            .toEqual({ min: -2, max: 9 })
    })

    it('Should give the same value as both ends for one cell', () => {
        expect(getValueRange([cell(4)]))
            .toEqual({ min: 4, max: 4 })
    })

    it('Should give an empty range for no cells', () => {
        expect(getValueRange([]))
            .toEqual({ min: Infinity, max: -Infinity })
    })

    it('Should handle many cells', () => {
        expect(getValueRange(Array.from({ length: 300000 }, (_, index) => cell(index))))
            .toEqual({ min: 0, max: 299999 })
    })
})