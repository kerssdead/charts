import Chart from '@/Chart'
import ChartOptions from '@/types/ChartOptions'
import { Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const mockRendererCalls: string[] = []

jest.mock('@/renderer/Renderer', () => ({
    __esModule: true,
    default: class {
        apply() {
            mockRendererCalls.push('apply')
        }

        destroy() {
            mockRendererCalls.push('destroy')
        }

        suspend() {
            mockRendererCalls.push('suspend')
        }

        resume() {
            mockRendererCalls.push('resume')
        }

        render() {
            mockRendererCalls.push('render')
        }

        resize() {
            mockRendererCalls.push('resize')
        }
    }
}))

type FakeObserver = {
    callback: (entries: unknown[]) => void
    observe: jest.Mock
    disconnect: jest.Mock
}

let observer: FakeObserver | null = null

const settings = (contextMenu?: ChartOptions['contextMenu']) => {
    return { title: 'Working', data: { values: [] }, contextMenu } as unknown as ChartOptions
}

let host: FakeElement

beforeEach(() => {
    const body = installFakeDocument()
    const media = { matches: false, addEventListener() {}, removeEventListener() {} }

    host = new FakeElement(Tag.Div)
    body.appendChild(host)

    observer = null

    Object.assign(globalThis, {
        window: { devicePixelRatio: 1, matchMedia: () => media },
        matchMedia: () => media,
        ResizeObserver: class {
            callback: (entries: unknown[]) => void

            observe = jest.fn()

            disconnect = jest.fn()

            constructor(callback: (entries: unknown[]) => void) {
                this.callback = callback
                observer = this as unknown as FakeObserver
            }
        }
    })

    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockRendererCalls.length = 0
})

afterEach(() => {
    jest.restoreAllMocks()
})

const create = (initial: ChartOptions) => {
    return new Chart(host as unknown as HTMLElement, initial)
}

const canvas = () => host.elements.find(element => element.tagName === Tag.Canvas) as FakeElement

describe('Rendering chart', () => {
    it('Should render through the renderer', () => {
        const chart = create(settings())

        chart.render()

        expect(mockRendererCalls)
            .toContain('render')
    })

    it('Should not render after the chart is destroyed', () => {
        const chart = create(settings())

        chart.destroy()
        mockRendererCalls.length = 0

        chart.render()

        expect(mockRendererCalls)
            .not.toContain('render')
    })
})

describe('Destroying chart', () => {
    it('Should stop the renderer only once', () => {
        const chart = create(settings())

        chart.destroy()
        chart.destroy()

        expect(mockRendererCalls.filter(call => call === 'destroy'))
            .toHaveLength(1)
    })
})

describe('Suspending chart', () => {
    it('Should suspend the renderer when the canvas is detached', () => {
        const chart = create(settings())

        canvas().remove()
        observer?.callback([])

        expect(mockRendererCalls)
            .toContain('suspend')
        expect(chart)
            .toBeDefined()
    })

    it('Should resume the renderer when the canvas is attached again', () => {
        const chart = create(settings())
        const target = canvas()

        target.remove()
        observer?.callback([])

        host.appendChild(target)
        observer?.callback([])

        expect(mockRendererCalls.filter(call => call === 'resume'))
            .toHaveLength(1)
        expect(mockRendererCalls.filter(call => call === 'suspend'))
            .toHaveLength(1)
    })
})

describe('Resizing chart', () => {
    it('Should resize and render through the renderer', () => {
        create(settings())

        observer?.callback([{ target: host, contentRect: { width: 100, height: 50 } }])

        expect(mockRendererCalls)
            .toContain('resize')
        expect(mockRendererCalls)
            .toContain('render')
    })
})

describe('Binding menu actions', () => {
    it('Should bind missing actions of context menu items', () => {
        const chart = create(settings([{ id: 'custom', text: 'Custom' }, { id: undefined, text: 'None' }]))

        chart.render()

        expect(mockRendererCalls)
            .toContain('render')
    })
})
