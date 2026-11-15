import { installMenuPopup } from './MenuPopupTestData'

describe('Showing menu popup', () => {
    it('Should append the popup and focus the first button', () => {
        const { body, popup, element, buttons } = installMenuPopup()

        popup.show({ x: 10, y: 20 })

        expect(body.elements)
            .toContain(element)
        expect(buttons[0].focus)
            .toHaveBeenCalledWith({ preventScroll: true })
    })
})