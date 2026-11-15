import { FakeElement, installFakeDocument } from './FakeDocument'

export class FakeTemplate extends FakeElement {
    innerHTML = '<b>${ Name }</b>'

    constructor() {
        super('template')
    }
}

export const installCustomTooltipEnvironment = () => {
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

            return element
        }
    })

    Object.assign(document, {
        documentElement: { clientWidth: 800, clientHeight: 600 },
        fullscreenElement: undefined,
        getElementById: () => null
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
            addEventListener: () => undefined
        },
        ResizeObserver: class {
            observe = jest.fn()

            disconnect = jest.fn()
        }
    })

    return {
        body,
        canvas: canvas as unknown as HTMLCanvasElement
    }
}

afterEach(() => {
    for (const name of ['document', 'window', 'ResizeObserver', 'HTMLTemplateElement'])
        delete (globalThis as Record<string, unknown>)[name]
})