import { SYSTEM_FONT_FAMILY } from '@/static/Typography'
import MenuPopup from '@/renderer/MenuPopup'
import { ContextMenu } from '@/static/constants/Index'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { DARK_THEME } from './TestTheme'
import { Events } from '@/static/Enums'

const popupElement = (popup: MenuPopup) => {
    return (popup as unknown as { floating: { element: FakeElement } }).floating.element
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).document
})

describe('Creating menu popup', () => {
    it('Should style the popup and its buttons with the theme', () => {
        installFakeDocument()

        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action: () => {} }],
            theme: DARK_THEME,
            select: jest.fn(),
            dismiss: jest.fn()
        })
        const element = popupElement(popup)
        const button = element.elements.find(child => child.tagName === 'button')

        expect([element.style.background, element.style.color])
            .toEqual([DARK_THEME.floatingBackground, DARK_THEME.text])
        expect(element.style.border)
            .toBe(`1px solid ${ DARK_THEME.dropdownBorder }`)
        expect(element.style.boxShadow)
            .toContain('0 8px 32px')
        expect(element.style.backdropFilter)
            .toBe('blur(12px)')
        expect(element.style.font)
            .toContain(SYSTEM_FONT_FAMILY)
        expect(button?.textContent)
            .toBe('Run')
        expect([button?.style.height, button?.style.minHeight])
            .toEqual(['auto', `${ ContextMenu.buttonHeight }px`])
        expect(button?.style.backdropFilter)
            .toBe('none')
    })

    it('Should use the theme colours for hover and dividers', () => {
        installFakeDocument()

        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action: () => {} }, { text: '', action: () => {}, isDivider: true }],
            theme: DARK_THEME,
            select: jest.fn(),
            dismiss: jest.fn()
        })
        const element = popupElement(popup)
        const button = element.elements.find(child => child.tagName === 'button')
        const divider = element.elements.find(child => child.tagName === 'div')

        button?.dispatch(Events.PointerEnter)

        expect(button?.style.background)
            .toBe(DARK_THEME.contextMenuButtonHover)
        expect(divider?.style.background)
            .toBe(DARK_THEME.dropdownBorder)

        button?.dispatch(Events.PointerLeave)

        expect(button?.style.background)
            .toBe(DARK_THEME.contextMenuButton)
    })

    it('Should select the button action', () => {
        installFakeDocument()

        const action = jest.fn()
        const select = jest.fn()
        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action }],
            theme: DARK_THEME,
            select,
            dismiss: jest.fn()
        })
        const button = popupElement(popup).elements.find(child => child.tagName === 'button')

        button?.dispatch(Events.Click)

        expect(select)
            .toHaveBeenCalledWith(action)
    })

    it('Should not select the button action while the popup is not interactive', () => {
        installFakeDocument()

        const select = jest.fn()
        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action: () => {} }],
            theme: DARK_THEME,
            select,
            dismiss: jest.fn()
        })
        const button = popupElement(popup).elements.find(child => child.tagName === 'button')

        popup.update(.5, false)
        button?.dispatch(Events.Click)

        expect(select)
            .not.toHaveBeenCalled()
    })

    it('Should highlight the focused button only after keyboard use', () => {
        installFakeDocument()

        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action: () => {} }],
            theme: DARK_THEME,
            select: jest.fn(),
            dismiss: jest.fn()
        })
        const element = popupElement(popup)
        const button = element.elements.find(child => child.tagName === 'button')

        Object.assign(document, { activeElement: button })
        button?.dispatch(Events.Focus)

        expect(button?.style.background)
            .toBe(DARK_THEME.contextMenuButton)

        element.dispatch(Events.KeyDown, { key: 'ArrowDown', preventDefault: jest.fn(), stopPropagation: jest.fn() })
        button?.dispatch(Events.Blur)
        button?.dispatch(Events.Focus)

        expect([button?.style.background, button?.style.color])
            .toEqual([DARK_THEME.text, DARK_THEME.background])
    })

    it('Should block the browser context menu over the popup', () => {
        installFakeDocument()

        const popup = new MenuPopup({} as HTMLCanvasElement, {
            options: [{ text: 'Run', action: () => {} }],
            theme: DARK_THEME,
            select: jest.fn(),
            dismiss: jest.fn()
        })
        const event = { preventDefault: jest.fn() }

        popupElement(popup).dispatch(Events.ContextMenu, event)

        expect(event.preventDefault)
            .toHaveBeenCalled()
    })
})