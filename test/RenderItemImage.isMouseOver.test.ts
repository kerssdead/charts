import { image, WINDOW } from './RenderItemImageTestData'

describe('Checking image hover', () => {
    it('Should hit points inside the circle', () => {
        const item = image()

        item.adjust(WINDOW)

        expect(item.isMouseOver({ x: 200, y: 400 }))
            .toBe(true)
        expect(item.isMouseOver({ x: 300, y: 400 }))
            .toBe(false)
    })
})