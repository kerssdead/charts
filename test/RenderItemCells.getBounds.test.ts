import { cellsItem, WINDOW } from './RenderItemCellsTestData'

describe('Getting bounds of cells', () => {
    it('Should give the edges of the box on the canvas', () => {
        const item = cellsItem()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 200, top: 400, right: 300, bottom: 450 })
    })

    it('Should give an empty box before it is adjusted', () => {
        expect(cellsItem().getBounds())
            .toEqual({ left: 0, top: 0, right: 0, bottom: 0 })
    })
})