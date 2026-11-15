import MenuPopup from '@/renderer/MenuPopup'
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
            .toEqual([DARK_THEME.contextMenuBackground, DARK_THEME.text])
        expect(element.style.border)
            .toBe(`1px solid ${ DARK_THEME.dropdownBorder }`)
        expect(button?.textContent)
            .toBe('Run')
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
})