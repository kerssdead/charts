import FloatingElement from '@/renderer/FloatingElement'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { Events } from '@/static/Enums'

const listeners: [string, () => void][] = []

let contentWidth = 100

const installEnvironment = () => {
    const body = installFakeDocument()

    const createElement = document.createElement.bind(document) as (tagName: string) => FakeElement

    Object.assign(document, {
        createElement: (tagName: string) => {
            const element = createElement(tagName)

            Object.assign(element, {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
                offsetHeight: 0
            })
            Object.defineProperty(element, 'offsetWidth', { get: () => contentWidth })

            if (tagName === 'div')
                Object.assign(element, { showPopover: jest.fn() })

            return element
        }
    })

    Object.assign(document, {
        documentElement: { clientWidth: 800, clientHeight: 600 },
        fullscreenElement: undefined
    })

    const canvas = new FakeElement('canvas')

    Object.assign(canvas, {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
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

    return { body, floating: new FloatingElement(canvas as unknown as HTMLCanvasElement, 8) }
}

afterEach(() => {
    for (const name of ['document', 'window', 'ResizeObserver'])
        delete (globalThis as Record<string, unknown>)[name]

    listeners.length = 0
    contentWidth = 100
})

describe('Setting floating element html', () => {
    it('Should replace the html and place the element using the new size', () => {
        const { floating } = installEnvironment()

        floating.show({ x: 700, y: 0 })

        const before = parseInt(floating.element.style.left, 10)

        contentWidth = 200
        floating.setHtml('<div>Wide</div>')
        floating.show({ x: 700, y: 0 })

        expect(floating.element.innerHTML)
            .toBe('<div>Wide</div>')
        expect(parseInt(floating.element.style.left, 10))
            .toBeLessThan(before)
    })
})
