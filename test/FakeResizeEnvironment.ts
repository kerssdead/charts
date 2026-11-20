import { FakeElement, installFakeDocument } from './FakeDocument'
import { Tag } from '@/static/Enums'

type Listener = {
    listener: () => void
    signal?: AbortSignal
}

export type FakeResizeEntry = {
    target: unknown
    contentRect?: { width: number, height: number }
    devicePixelContentBoxSize?: { inlineSize: number, blockSize: number }[]
}

export class FakeResizeObserver {
    static instances: FakeResizeObserver[] = []

    static supportsDevicePixels = true

    readonly targets: unknown[] = []

    isDisconnected = false

    private readonly callback: (entries: FakeResizeEntry[]) => void

    constructor(callback: (entries: FakeResizeEntry[]) => void) {
        this.callback = callback

        FakeResizeObserver.instances.push(this)
    }

    observe(target: unknown, options?: { box?: string }) {
        if (options?.box && !FakeResizeObserver.supportsDevicePixels)
            throw new Error('Unsupported box')

        this.targets.push(target)
    }

    disconnect() {
        this.isDisconnected = true
    }

    notify(entries: FakeResizeEntry[]) {
        this.callback(entries)
    }
}

export class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = []

    isDisconnected = false

    private readonly callback: (entries: { isIntersecting: boolean }[]) => void

    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        this.callback = callback

        FakeIntersectionObserver.instances.push(this)
    }

    observe() {}

    disconnect() {
        this.isDisconnected = true
    }

    notify(isIntersecting: boolean) {
        this.callback([{ isIntersecting }])
    }
}

export function installResizeEnvironment(devicePixelRatio: number = 1) {
    const ratioListeners: Listener[] = []
    const windowListeners = new Map<string, Listener[]>()
    const window = {
        devicePixelRatio,
        addEventListener: (type: string, listener: () => void, options?: { signal?: AbortSignal }) => {
            windowListeners.set(type, [...windowListeners.get(type) ?? [], { listener, signal: options?.signal }])
        }
    }
    const body = installFakeDocument()
    const element = new FakeElement(Tag.Div)

    body.appendChild(element)

    FakeResizeObserver.instances = []
    FakeResizeObserver.supportsDevicePixels = true
    FakeIntersectionObserver.instances = []

    Object.assign(globalThis, {
        window,
        ResizeObserver: FakeResizeObserver,
        IntersectionObserver: FakeIntersectionObserver,
        matchMedia: () => ({
            addEventListener: (_type: string, listener: () => void, options?: { signal?: AbortSignal }) => {
                ratioListeners.push({ listener, signal: options?.signal })
            }
        })
    })

    return {
        element,
        get observer() {
            return FakeResizeObserver.instances[0]
        },
        get visibility() {
            return FakeIntersectionObserver.instances[0]
        },
        setInViewport(isInViewport: boolean) {
            this.visibility.notify(isInViewport)
        },
        dispatchWindowEvent(type: string) {
            for (const { listener, signal } of windowListeners.get(type) ?? [])
                if (!signal?.aborted)
                    listener()
        },
        resizeElement(width: number, height: number) {
            this.observer.notify([{ target: element, contentRect: { width, height } }])
        },
        changeRatio(ratio: number) {
            window.devicePixelRatio = ratio

            for (const { listener, signal } of ratioListeners.splice(0))
                if (!signal?.aborted)
                    listener()
        }
    }
}

export function removeResizeEnvironment() {
    for (const name of ['window', 'ResizeObserver', 'IntersectionObserver', 'matchMedia', 'document'])
        delete (globalThis as Record<string, unknown>)[name]
}