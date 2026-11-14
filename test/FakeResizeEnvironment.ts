import { FakeElement, installFakeDocument } from './FakeDocument'
import { Tag } from '@/static/Enums'

type RatioListener = {
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

export function installResizeEnvironment(devicePixelRatio: number = 1) {
    const ratioListeners: RatioListener[] = []
    const window = { devicePixelRatio }
    const body = installFakeDocument()
    const element = new FakeElement(Tag.Div)

    body.appendChild(element)

    FakeResizeObserver.instances = []
    FakeResizeObserver.supportsDevicePixels = true

    Object.assign(globalThis, {
        window,
        ResizeObserver: FakeResizeObserver,
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
    for (const name of ['window', 'ResizeObserver', 'matchMedia', 'document'])
        delete (globalThis as Record<string, unknown>)[name]
}