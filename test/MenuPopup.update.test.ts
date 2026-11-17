import { installMenuPopup } from './MenuPopupTestData'

describe('Updating menu popup', () => {
    it('Should update opacity, pointer events and button state', () => {
        const { popup, element, buttons } = installMenuPopup()

        popup.update(.5, false)

        expect([element.style.opacity, element.style.transform, element.style.pointerEvents, buttons[0].disabled])
            .toEqual(['0.5', 'scale(1.025)', 'none', true])

        popup.update(1, true)

        expect([element.style.opacity, element.style.transform, element.style.pointerEvents, buttons[0].disabled])
            .toEqual(['1', 'scale(1)', 'auto', false])
    })

    it('Should leave buttons alone when interactivity did not change', () => {
        const { popup, buttons } = installMenuPopup()

        buttons[0].disabled = true
        popup.update(1, true)

        expect(buttons[0].disabled)
            .toBe(true)
    })
})