import { arc, WINDOW } from './RenderItemArcTestData'

describe('Getting arc focus bounds', () => {
    it('Should have no ring bounds', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect(target.getFocusBounds())
            .toBeNull()
    })
})