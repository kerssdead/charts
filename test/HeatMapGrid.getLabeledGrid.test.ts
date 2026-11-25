import { getLabeledGrid } from '@/render/heatMap/HeatMapGrid'
import { labeled } from './HeatMapTestData'

describe('Getting a labeled grid', () => {
    it('Should count columns and rows by labels', () => {
        const grid = getLabeledGrid(labeled([['a', 'x', 1], ['b', 'x', 2], ['a', 'y', 3]]), null)

        expect(grid.columns)
            .toBe(2)
        expect(grid.rows)
            .toBe(2)
    })

    it('Should place every cell by its labels', () => {
        const grid = getLabeledGrid(labeled([['a', 'x', 1], ['b', 'y', 2]]), null)

        expect(grid.cells.map(({ column, row, value }) => [column, row, value]))
            .toEqual([[0, 0, 1], [1, 1, 2]])
    })

    it('Should follow the order of given labels', () => {
        const data = labeled([['a', 'x', 1], ['b', 'y', 2]], { xLabels: ['b', 'a'], yLabels: ['y', 'x'] })

        expect(getLabeledGrid(data, null).cells.map(({ column, row }) => [column, row]))
            .toEqual([[1, 1], [0, 0]])
    })

    it('Should name cells after their position', () => {
        const [cell] = getLabeledGrid(labeled([['a', 'x', 1]]), null).cells

        expect(cell.label)
            .toBe('x / a')
    })

    it('Should keep the colors of cells', () => {
        const data = labeled([['a', 'x', 1]])

        data.values[0].color = '#112233'

        expect(getLabeledGrid(data, null).cells[0].color)
            .toBe('#112233')
    })

    it('Should give the value range and the extent', () => {
        const grid = getLabeledGrid(labeled([['a', 'x', 4], ['b', 'x', 9]]), { width: 10, height: 5 })

        expect(grid.min)
            .toBe(4)
        expect(grid.max)
            .toBe(9)
        expect(grid.extent)
            .toEqual({ width: 10, height: 5 })
    })
})