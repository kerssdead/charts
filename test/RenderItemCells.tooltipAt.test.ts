import { cellsData, cellsItem, RED, WINDOW } from './RenderItemCellsTestData'

const item = () => {
    const shape = cellsItem(cellsData([RED, 0, RED, RED], { columns: 2, rows: 2 }))

    shape.lookup = index => `cell ${ index }`
    shape.adjust(WINDOW)

    return shape
}

describe('Getting the tooltip of cells', () => {
    it('Should describe the cell under the pointer', () => {
        expect(item().tooltipAt({ x: 220, y: 440 }))
            .toBe('cell 2')
    })

    it('Should describe nothing where there is no cell', () => {
        expect(item().tooltipAt({ x: 280, y: 410 }))
            .toBeNull()
    })

    it('Should describe nothing outside the box', () => {
        expect(item().tooltipAt({ x: 220, y: 300 }))
            .toBeNull()
    })
})