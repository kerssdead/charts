import { arc, WINDOW } from './RenderItemArcTestData'

describe('Bounding arc', () => {
    it('Should bound the arc by its radius', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect(target.getBounds())
            .toEqual({ left: 2000, top: 2000, right: 3000, bottom: 3000 })
    })
})