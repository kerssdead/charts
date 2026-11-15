import { installMenuPopup } from './MenuPopupTestData'

describe('Removing menu popup', () => {
    it('Should remove the popup element', () => {
        const { body, popup, element } = installMenuPopup()

        popup.show({ x: 10, y: 20 })
        popup.remove()

        expect(body.elements)
            .not.toContain(element)
        expect(element.isConnected)
            .toBe(false)
    })
})