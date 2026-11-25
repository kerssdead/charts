import { fieldItem, WINDOW } from './RenderItemFieldTestData'

describe('Checking field hover', () => {
    it('Should hit points inside the box', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(item.isMouseOver({ x: 250, y: 425 }))
            .toBe(true)
        expect(item.isMouseOver({ x: 200, y: 400 }))
            .toBe(true)
    })

    it('Should miss points outside the box', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(item.isMouseOver({ x: 199, y: 425 }))
            .toBe(false)
        expect(item.isMouseOver({ x: 250, y: 451 }))
            .toBe(false)
    })
})