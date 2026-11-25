import { getResolution } from '@/render/heatMap/HeatMapLayout'
import { DEFAULT_RESOLUTION, MAX_RESOLUTION } from '@/render/heatMap/HeatMapConstants'

const EXTENT = { width: 1200, height: 800 }

describe('Getting resolution', () => {
    it('Should take columns from a number and rows from the extent', () => {
        expect(getResolution(30, EXTENT))
            .toEqual({ columns: 30, rows: 20 })
    })

    it('Should round the rows', () => {
        expect(getResolution(40, EXTENT))
            .toEqual({ columns: 40, rows: 27 })
    })

    it('Should take both counts from an object', () => {
        expect(getResolution({ columns: 10, rows: 5 }, EXTENT))
            .toEqual({ columns: 10, rows: 5 })
    })

    it('Should limit the counts', () => {
        expect(getResolution({ columns: 100000, rows: -3 }, EXTENT))
            .toEqual({ columns: MAX_RESOLUTION, rows: 1 })
    })

    it('Should use the default for numbers that are not usable', () => {
        expect(getResolution(NaN, EXTENT).columns)
            .toBe(DEFAULT_RESOLUTION)
    })

    it('Should always give at least one row', () => {
        expect(getResolution(10, { width: 10000, height: 1 }).rows)
            .toBe(1)
    })
})