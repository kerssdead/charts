import { installMenuPopup } from './MenuPopupTestData'

describe('Updating menu popup', () => {
    it('Should update opacity, pointer events and button state', () => {
        const { popup, element, buttons } = installMenuPopup()

        popup.update(.5, false)

        expect([element.style.opacity, element.style.pointerEvents, buttons[0].disabled])
            .toEqual(['0.5', 'none', true])

        popup.update(1, true)

        expect([element.style.opacity, element.style.pointerEvents, buttons[0].disabled])
            .toEqual(['1', 'auto', false])
    })
})