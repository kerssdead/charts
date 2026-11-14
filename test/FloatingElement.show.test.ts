import FloatingElement from '@/renderer/FloatingElement'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { Events } from '@/static/Enums'

const listeners: [string, () => void][] = []

let observer: { observe: jest.Mock, disconnect: jest.Mock, targets: unknown[] } | null = null

const installEnvironment = (offset: number = 8) => {
    const body = installFakeDocument()

    const createElement = document.createElement.bind(document) as (tagName: string) => FakeElement

    document.createElement = (tagName: string) => {
        const element = createElement(tagName)

        Object.assign(element, {
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
            offsetWidth: 0,
            offsetHeight: 0
        })

        if (tagName === 'div')
            Object.assign(element, { showPopover: jest.fn() })

        return element
    }

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

    observer = {
        observe: jest.fn(),
        disconnect: jest.fn(),
        targets: []
    }

    Object.assign(globalThis, {
        window: {
            devicePixelRatio: 1,
            visualViewport: undefined,
            addEventListener: (type: string, listener: () => void) => listeners.push([type, listener])
        },
        ResizeObserver: class {
            callback: () => void

            constructor(callback: () => void) {
                this.callback = callback
            }

            observe = (target: unknown) => observer!.observe(target)

            disconnect = () => observer!.disconnect()
        }
    })

    return {
        body,
        canvas: canvas as unknown as HTMLCanvasElement,
        floating: new FloatingElement(canvas as unknown as HTMLCanvasElement, offset),
        notifyResize() {
            for (const [type, listener] of listeners.splice(0))
                if (type === Events.Resize)
                    listener()
        }
    }
}

afterEach(() => {
    for (const name of ['document', 'window', 'ResizeObserver'])
        delete (globalThis as Record<string, unknown>)[name]

    listeners.length = 0
    observer = null
})

describe('Creating floating element', () => {
    it('Should position the element over the canvas', () => {
        const { floating } = installEnvironment()

        expect(floating.element.style.position)
            .toBe('fixed')
        expect(floating.element.style.zIndex)
            .toBe('10000')
    })
})

describe('Showing floating element', () => {
    it('Should append the element to the document and place it', () => {
        const { body, floating } = installEnvironment()

        floating.show({ x: 50, y: 50 })

        expect(body.elements)
            .toContain(floating.element)
        expect(parseInt(floating.element.style.left, 10))
            .toBeGreaterThanOrEqual(8)
        expect(parseInt(floating.element.style.top, 10))
            .toBeGreaterThanOrEqual(8)
        expect(floating.element.style.maxWidth)
            .toBe('784px')
        expect(observer?.observe)
            .toHaveBeenCalledWith(floating.element)
    })

    it('Should not append the element twice', () => {
        const { body, floating } = installEnvironment()

        floating.show({ x: 1, y: 1 })
        floating.show({ x: 2, y: 2 })

        expect(body.children.filter(child => child === floating.element))
            .toHaveLength(1)
    })

    it('Should open the element as a popover when supported', () => {
        const { floating } = installEnvironment()

        floating.show({ x: 0, y: 0 })

        const popover = (floating.element as unknown as { showPopover: jest.Mock }).showPopover

        expect(floating.element.popover)
            .toBe('manual')
        expect(popover)
            .toHaveBeenCalledTimes(1)
    })

    it('Should re-place the element on window resize', () => {
        const { floating, notifyResize } = installEnvironment()

        floating.show({ x: 10, y: 10 })

        const before = floating.element.style.left

        notifyResize()

        expect(floating.element.style.left)
            .toBe(before)
    })
})

describe('Removing floating element', () => {
    it('Should disconnect the observer and remove the element', () => {
        const { body, floating } = installEnvironment()

        floating.show({ x: 0, y: 0 })
        floating.remove()

        expect(observer?.disconnect)
            .toHaveBeenCalled()
        expect(body.elements)
            .not.toContain(floating.element)
        expect(floating.element.isConnected)
            .toBe(false)
    })
})
