import { cellsData, cellsItem, RED, WINDOW } from './RenderItemCellsTestData'

const item = () => {
    const shape = cellsItem(cellsData([RED, 0, RED, RED], { columns: 2, rows: 2 }))

    shape.dataLookup = index => ({ id: String(index) })
    shape.adjust(WINDOW)

    return shape
}

describe('Getting the data of cells', () => {
    it('Should give the data of the cell under the pointer', () => {
        expect(item().dataAt({ x: 280, y: 440 }))
            .toEqual({ id: '3' })
    })

    it('Should give nothing where there is no cell', () => {
        expect(item().dataAt({ x: 280, y: 410 }))
            .toBeNull()
    })

    it('Should give nothing outside the box', () => {
        expect(item().dataAt({ x: 400, y: 440 }))
            .toBeNull()
    })
})