import { installMenuPopup } from './MenuPopupTestData'
import { Events } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

describe('Showing menu popup', () => {
    it('Should append the popup and focus the first button', () => {
        const { body, popup, element, buttons } = installMenuPopup()

        popup.show({ x: 10, y: 20 })

        expect(body.elements)
            .toContain(element)
        expect(buttons[0].focus)
            .toHaveBeenCalledWith({ preventScroll: true })
    })

    it('Should keep the selection hidden until the keyboard is used', () => {
        const { popup, buttons } = installMenuPopup()

        popup.show({ x: 10, y: 20 })
        buttons[0].dispatch(Events.Focus)

        expect(buttons[0].style.background)
            .toBe(DARK_THEME.contextMenuButton)
        expect(buttons[0].style.color)
            .toBe('inherit')
        expect(buttons[0].style.boxShadow)
            .toBe('none')
    })
})