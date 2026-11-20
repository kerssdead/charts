import Chart from '@/Chart'
import ChartOptions from '@/types/ChartOptions'
import { Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { rendererCalls, rendererErrorHandlers, rendererFailures, rendererSettings } from './ChartRendererMock'

type Listener = () => void

export const chartSettings = (overrides: Partial<ChartOptions> = {}) => {
    return { title: 'Chart', data: { values: [] }, ...overrides } as unknown as ChartOptions
}

export const installChartEnvironment = () => {
    const body = installFakeDocument()
    const mediaListeners: Listener[] = []
    const media = {
        matches: false,
        addEventListener: (_type: string, listener: Listener) => mediaListeners.push(listener),
        removeEventListener: () => {}
    }
    const host = new FakeElement(Tag.Div)
    const observers: { callback: (entries: unknown[]) => void }[] = []

    body.appendChild(host)
    rendererCalls.length = 0
    rendererSettings.length = 0
    rendererErrorHandlers.length = 0
    delete rendererFailures.apply
    delete rendererFailures.destroy

    Object.assign(globalThis, {
        window: { devicePixelRatio: 1, matchMedia: () => media },
        matchMedia: () => media,
        ResizeObserver: class {
            callback: (entries: unknown[]) => void

            constructor(callback: (entries: unknown[]) => void) {
                this.callback = callback
                observers.push(this)
            }

            observe() {}

            disconnect() {}
        }
    })

    return {
        host,
        media,
        observer: () => observers[0],
        changeTheme: (isDark: boolean) => {
            media.matches = isDark
            mediaListeners.forEach(listener => listener())
        },
        canvas: () => host.elements.find(element => element.tagName === Tag.Canvas) as FakeElement,
        create: (settings: ChartOptions = chartSettings()) => new Chart(host as unknown as HTMLElement, settings)
    }
}

export const installEnvironmentListeners = () => {
    const fontListeners = new Set<Listener>()
    const motionListeners = new Set<Listener>()
    const theme = { matches: false, addEventListener() {}, removeEventListener() {} }
    const motion = {
        matches: false,
        addEventListener: (_type: string, listener: Listener) => motionListeners.add(listener),
        removeEventListener: (_type: string, listener: Listener) => motionListeners.delete(listener)
    }

    Object.assign(document, {
        fonts: {
            addEventListener: (_type: string, listener: Listener) => fontListeners.add(listener),
            removeEventListener: (_type: string, listener: Listener) => fontListeners.delete(listener)
        }
    })
    Object.assign(globalThis, {
        matchMedia: (query: string) => query.includes('reduced-motion') ? motion : theme
    })

    return {
        count: () => fontListeners.size + motionListeners.size,
        finishFontLoading: () => fontListeners.forEach(listener => listener())
    }
}

export const removeChartEnvironment = () => {
    for (const name of ['document', 'window', 'matchMedia', 'ResizeObserver'])
        delete (globalThis as Record<string, unknown>)[name]
}
