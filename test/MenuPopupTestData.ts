import MenuPopup from '@/renderer/MenuPopup'
import ButtonOptions from '@/types/ButtonOptions'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { DARK_THEME } from './TestTheme'

const listeners: [string, () => void][] = []

export type MenuButtonElement = FakeElement & { focus: jest.Mock }

export const popupElement = (popup: MenuPopup) => {
    return (popup as unknown as { floating: { element: FakeElement } }).floating.element
}

export const installMenuPopup = (options?: ButtonOptions[]) => {
    const body = installFakeDocument()
    const createElement = document.createElement.bind(document) as (tagName: string) => FakeElement

    Object.assign(document, {
        createElement: (tagName: string) => {
            const element = createElement(tagName)

            Object.assign(element, {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
                offsetWidth: 0,
                offsetHeight: 0
            })

            if (tagName === 'div')
                Object.assign(element, { showPopover: jest.fn() })

            if (tagName === 'button')
                Object.assign(element, { focus: jest.fn() })

            return element
        }
    })

    Object.assign(document, {
        documentElement: { clientWidth: 800, clientHeight: 600 },
        fullscreenElement: undefined
    })

    const canvas = new FakeElement('canvas')

    Object.assign(canvas, {
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 100 }),
        clientWidth: 100,
        clientHeight: 100,
        closest: () => null
    })

    Object.assign(globalThis, {
        window: {
            devicePixelRatio: 1,
            visualViewport: undefined,
            addEventListener: (type: string, listener: () => void) => listeners.push([type, listener])
        },
        ResizeObserver: class {
            observe = jest.fn()

            disconnect = jest.fn()
        }
    })

    const select = jest.fn()
    const dismiss = jest.fn()
    const popup = new MenuPopup(canvas as unknown as HTMLCanvasElement, {
        options: options ?? [{ text: 'Run', action: () => {} }],
        theme: DARK_THEME,
        select,
        dismiss
    })
    const element = popupElement(popup)
    const buttons = element.elements
                                 .filter(child => child.tagName === 'button') as MenuButtonElement[]

    return { body, canvas, popup, element, buttons, select, dismiss }
}

afterEach(() => {
    for (const name of ['document', 'window', 'ResizeObserver'])
        delete (globalThis as Record<string, unknown>)[name]

    listeners.length = 0
})