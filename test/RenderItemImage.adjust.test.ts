import { image, WINDOW } from './RenderItemImageTestData'

describe('Adjusting image to the window', () => {
    it('Should map the position and size to pixels', () => {
        const item = image()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 150, top: 350, right: 250, bottom: 450 })
    })
})