import QueueCellsItemBuilder from '@/builders/QueueCellsItemBuilder'
import { cellsData } from './RenderItemCellsTestData'

describe('Giving cells item its cells', () => {
    it('Should keep the cells on the shape', () => {
        const cells = cellsData([1, 2])

        expect(new QueueCellsItemBuilder().cells(cells).shape.cells)
            .toBe(cells)
    })

    it('Should have no cells by default', () => {
        expect(new QueueCellsItemBuilder().shape.cells)
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueCellsItemBuilder()

        expect(builder.cells(cellsData([1])))
            .toBe(builder)
    })
})