import { getCellsByIndex, getLabeledGrid } from '@/render/heatMap/HeatMapGrid'
import { labeled } from './HeatMapTestData'

describe('Getting heat map cells by index', () => {
    it('Should put every cell at its row and column', () => {
        const grid = getLabeledGrid(labeled([['a', 'x', 1], ['b', 'y', 2]]), null)

        expect(getCellsByIndex(grid).map(cell => cell?.value))
            .toEqual([1, undefined, undefined, 2])
    })

    it('Should have a place for every cell of the grid', () => {
        const grid = getLabeledGrid(labeled([['a', 'x', 1], ['b', 'x', 2], ['c', 'y', 3]]), null)

        expect(getCellsByIndex(grid))
            .toHaveLength(6)
    })
})