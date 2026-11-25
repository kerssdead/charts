import { image, WINDOW } from './RenderItemImageTestData'

describe('Adjusting image to the window', () => {
    it('Should map a box to pixels', () => {
        const item = image()

        item.box = { x: 1000, y: 2000, width: 500, height: 250 }
        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 200, top: 400, right: 300, bottom: 450 })
    })

    it('Should map the position and size to pixels', () => {
        const item = image()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 150, top: 350, right: 250, bottom: 450 })
    })
})