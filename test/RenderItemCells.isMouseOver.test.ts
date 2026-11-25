import { cellsData, cellsItem, RED, WINDOW } from './RenderItemCellsTestData'

const item = (colors = [RED, 0]) => {
    const shape = cellsItem(cellsData(colors))

    shape.adjust(WINDOW)

    return shape
}

describe('Checking whether the pointer is over cells', () => {
    it('Should be over a cell', () => {
        expect(item().isMouseOver({ x: 220, y: 420 }))
            .toBe(true)
    })

    it('Should not be over a place without a cell', () => {
        expect(item().isMouseOver({ x: 280, y: 420 }))
            .toBe(false)
    })

    it('Should not be over anything outside the box', () => {
        expect(item().isMouseOver({ x: 100, y: 420 }))
            .toBe(false)
    })

    it('Should count the far edge as part of the last cell', () => {
        expect(item([RED, RED]).isMouseOver({ x: 300, y: 450 }))
            .toBe(true)
    })

    it('Should not be over anything without cells', () => {
        const shape = cellsItem(null)

        shape.adjust(WINDOW)

        expect(shape.isMouseOver({ x: 220, y: 420 }))
            .toBe(false)
    })
})