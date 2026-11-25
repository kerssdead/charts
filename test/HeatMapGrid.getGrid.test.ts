import { getGrid } from '@/render/heatMap/HeatMapGrid'
import { labeled, points } from './HeatMapTestData'

const EXTENT = { width: 100, height: 100 }

describe('Getting a grid', () => {
    it('Should lay out labeled cells without a resolution', () => {
        const grid = getGrid(labeled([['a', 'x', 1], ['b', 'x', 2]]), null)

        expect(grid.cells)
            .toHaveLength(2)
        expect(grid.columns)
            .toBe(2)
    })

    it('Should sum points that fall into the same cell', () => {
        const grid = getGrid(points([[10, 10, 1], [12, 11, 2], [90, 90, 4]], EXTENT), null)

        expect(grid.cells.map(({ column, row, value }) => [column, row, value]))
            .toEqual([[1, 1, 3], [9, 9, 4]])
    })

    it('Should give the cells of points a coordinate label', () => {
        const [cell] = getGrid(points([[15, 25, 1]], EXTENT), null).cells

        expect(cell.label)
            .toBe('x 10–20, y 20–30')
    })

    it('Should skip points outside the extent', () => {
        const grid = getGrid(points([[10, 10, 1], [-5, 10, 5], [10, 200, 5]], EXTENT), null)

        expect(grid.cells.map(cell => cell.value))
            .toEqual([1])
    })

    it('Should put points on the far edge into the last cell', () => {
        const [cell] = getGrid(points([[100, 100, 1]], EXTENT), null).cells

        expect([cell.column, cell.row])
            .toEqual([9, 9])
    })

    it('Should take the rows from the extent aspect ratio', () => {
        const grid = getGrid(points([[1, 1, 1]], { width: 200, height: 100 }), null)

        expect([grid.columns, grid.rows])
            .toEqual([10, 5])
    })

    it('Should use the image extent when the data has none', () => {
        const grid = getGrid(points([[1, 1, 1]]), { width: 400, height: 100 })

        expect(grid.extent)
            .toEqual({ width: 400, height: 100 })
        expect(grid.rows)
            .toBe(3)
    })

    it('Should prefer the extent of the data to the image', () => {
        const grid = getGrid(points([[1, 1, 1]], EXTENT), { width: 400, height: 100 })

        expect(grid.extent)
            .toEqual(EXTENT)
    })

    it('Should fit the extent to the points when nothing else gives one', () => {
        const grid = getGrid(points([[40, 20, 1], [10, 10, 1]]), null)

        expect(grid.extent)
            .toEqual({ width: 40, height: 20 })
    })

    it('Should give the value range of the cells', () => {
        const grid = getGrid(points([[10, 10, 1], [90, 90, 4]], EXTENT), null)

        expect([grid.min, grid.max])
            .toEqual([1, 4])
    })
})