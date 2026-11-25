import { cellsItem, WINDOW } from './RenderItemCellsTestData'

describe('Adjusting cells to the canvas', () => {
    it('Should map the box to the canvas', () => {
        const item = cellsItem()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 200, top: 400, right: 300, bottom: 450 })
    })

    it('Should move the box from the previous one while morphing', () => {
        const previous = cellsItem()
        const item = cellsItem()

        item.box = { x: 2000, y: 2000, width: 500, height: 250 }
        item.morphFrom(previous, 1)
        item.adjust(WINDOW, .5)

        expect(item.getBounds().left)
            .toBe(300)
    })

    it('Should take its own box once the morph is done', () => {
        const previous = cellsItem()
        const item = cellsItem()

        item.box = { x: 2000, y: 2000, width: 500, height: 250 }
        item.morphFrom(previous, 1)
        item.adjust(WINDOW, 1)

        expect(item.getBounds().left)
            .toBe(400)
    })
})