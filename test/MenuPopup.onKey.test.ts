import { Events } from '@/static/Enums'
import { installMenuPopup } from './MenuPopupTestData'

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
})