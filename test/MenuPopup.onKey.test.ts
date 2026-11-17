import { Events } from '@/static/Enums'
import { installMenuPopup } from './MenuPopupTestData'
import { DARK_THEME } from './TestTheme'

const keyEvent = (key: string) => {
    return {
        key,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
    }
}

const setActiveElement = (element: unknown) => {
    const target = document as unknown as { activeElement: unknown }

    target.activeElement = element
}

describe('Handling menu popup keys', () => {
    it('Should move focus with arrow, home and end keys', () => {
        const { element, buttons } = installMenuPopup([
            { text: 'First', action: () => {} },
            { text: 'Second', action: () => {} }
        ])

        const down = keyEvent('ArrowDown')

        setActiveElement(buttons[0])
        element.dispatch(Events.KeyDown, down)

        expect(buttons[1].focus)
            .toHaveBeenCalled()
        expect(down.preventDefault)
            .toHaveBeenCalled()

        setActiveElement(buttons[0])

        const up = keyEvent('ArrowUp')

        element.dispatch(Events.KeyDown, up)

        expect(buttons[1].focus)
            .toHaveBeenCalledTimes(2)

        element.dispatch(Events.KeyDown, keyEvent('Home'))

        expect(buttons[0].focus)
            .toHaveBeenCalled()

        element.dispatch(Events.KeyDown, keyEvent('End'))

        expect(buttons[1].focus)
            .toHaveBeenCalledTimes(3)
    })

    it('Should reveal the highlight after a navigation key', () => {
        const { element, buttons } = installMenuPopup([
            { text: 'First', action: () => {} },
            { text: 'Second', action: () => {} }
        ])

        setActiveElement(buttons[0])
        element.dispatch(Events.KeyDown, keyEvent('ArrowDown'))

        expect([buttons[0].style.background, buttons[1].style.background])
            .toEqual([DARK_THEME.contextMenuButton, DARK_THEME.text])
        expect(buttons[1].style.color)
            .toBe(DARK_THEME.background)
    })

    it('Should reveal the highlight on enter without blocking the action', () => {
        const { element, buttons } = installMenuPopup([
            { text: 'First', action: () => {} },
            { text: 'Second', action: () => {} }
        ])

        setActiveElement(buttons[1])

        const enter = keyEvent('Enter')

        element.dispatch(Events.KeyDown, enter)

        expect(buttons[1].style.background)
            .toBe(DARK_THEME.text)
        expect(buttons[1].style.color)
            .toBe(DARK_THEME.background)
        expect(enter.preventDefault)
            .not.toHaveBeenCalled()
    })

    it('Should reveal the highlight on space without blocking the action', () => {
        const { element, buttons } = installMenuPopup([
            { text: 'First', action: () => {} },
            { text: 'Second', action: () => {} }
        ])

        setActiveElement(buttons[0])

        const space = keyEvent(' ')

        element.dispatch(Events.KeyDown, space)

        expect(buttons[0].style.background)
            .toBe(DARK_THEME.text)
        expect(buttons[0].style.color)
            .toBe(DARK_THEME.background)
        expect(space.preventDefault)
            .not.toHaveBeenCalled()
    })

    it('Should dismiss on escape and tab', () => {
        const { element, dismiss } = installMenuPopup()

        const escape = keyEvent('Escape')

        element.dispatch(Events.KeyDown, escape)

        expect(escape.preventDefault)
            .toHaveBeenCalled()
        expect(dismiss)
            .toHaveBeenCalledTimes(1)

        element.dispatch(Events.KeyDown, keyEvent('Tab'))

        expect(dismiss)
            .toHaveBeenCalledTimes(2)
    })

    it('Should move focus to the previous button with the up key', () => {
        const { element, buttons } = installMenuPopup([
            { text: 'First', action: () => {} },
            { text: 'Second', action: () => {} }
        ])

        setActiveElement(buttons[1])
        element.dispatch(Events.KeyDown, keyEvent('ArrowUp'))

        expect(buttons[0].focus)
            .toHaveBeenCalled()
    })

    it('Should handle navigation keys without buttons', () => {
        const { element } = installMenuPopup([])
        const end = keyEvent('End')

        setActiveElement(null)
        element.dispatch(Events.KeyDown, end)

        expect(end.preventDefault)
            .toHaveBeenCalled()
    })
})