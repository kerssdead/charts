import { arc, WINDOW } from './RenderItemArcTestData'

describe('Checking arc hover', () => {
    it('Should hit points inside the sector', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect(target.isMouseOver({ x: 2500, y: 2500 }))
            .toBe(true)
        expect(target.isMouseOver({ x: 5000, y: 2500 }))
            .toBe(false)
    })
})