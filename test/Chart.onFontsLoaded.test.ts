import Chart from '@/Chart'
import ChartOptions from '@/types/ChartOptions'
import { Tag } from '@/static/Enums'
import { clearTextWidths } from '@/helpers/Text'
import { FakeElement, installFakeDocument } from './FakeDocument'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    clearTextWidths: jest.fn()
}))

const mockApplies: unknown[] = []

jest.mock('@/renderer/Renderer', () => ({
    __esModule: true,
    default: class {
        apply(settings: { title?: string }) {
            mockApplies.push(settings)

            if (settings.title === 'Broken')
                throw new Error('Broken')
        }

        destroy() {}

        suspend() {}

        resume() {}

        render() {}

        resize() {}
    }
}))

const settings = { title: 'Chart', data: { values: [] } } as unknown as ChartOptions

const listeners = new Set<() => void>()

const fonts = {
    listeners,
    addEventListener: jest.fn((_type: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: jest.fn((_type: string, listener: () => void) => listeners.delete(listener))
}

const finishLoading = () => fonts.listeners.forEach(listener => listener())

let host: FakeElement

beforeEach(() => {
    const body = installFakeDocument()
    const media = { matches: false, addEventListener() {}, removeEventListener() {} }

    host = new FakeElement(Tag.Div)
    body.appendChild(host)
    mockApplies.length = 0
    fonts.listeners.clear()
    jest.clearAllMocks()

    Object.assign(document, { fonts })
    Object.assign(globalThis, {
        window: { devicePixelRatio: 1, matchMedia: () => media },
        matchMedia: () => media,
        ResizeObserver: class {
            observe() {}

            disconnect() {}
        }
    })
})

describe('Reacting to loaded fonts', () => {
    it('Should listen for loaded fonts', () => {
        new Chart(host as unknown as HTMLElement, settings)

        expect(fonts.addEventListener)
            .toHaveBeenCalledWith('loadingdone', expect.any(Function))
    })

    it('Should clear text widths and apply settings again when fonts are loaded', () => {
        new Chart(host as unknown as HTMLElement, settings)

        finishLoading()

        expect([(clearTextWidths as jest.Mock).mock.calls.length, mockApplies.length])
            .toEqual([1, 2])
    })

    it('Should not retry a failed chart when fonts are loaded', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})

        new Chart(host as unknown as HTMLElement, { ...settings, title: 'Broken' })

        finishLoading()

        expect([(clearTextWidths as jest.Mock).mock.calls.length, mockApplies.length])
            .toEqual([0, 1])
    })

    it('Should stop listening when destroyed', () => {
        const chart = new Chart(host as unknown as HTMLElement, settings)

        chart.destroy()
        finishLoading()

        expect([fonts.listeners.size, mockApplies.length])
            .toEqual([0, 1])
    })

    it('Should not fail when the document has no font loading support', () => {
        Object.assign(document, { fonts: undefined })

        expect(() => new Chart(host as unknown as HTMLElement, settings).destroy())
            .not.toThrow()
    })
})