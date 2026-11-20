import { installChartEnvironment, removeChartEnvironment } from './ChartTestData'
import { rendererCalls, rendererErrorHandlers } from './ChartRendererMock'

type HostEvents = {
    onResize: (width: number, height: number, ratio: number) => void
}

const hostEvents: HostEvents[] = []

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

jest.mock('@/renderer/CanvasHost', () => ({
    __esModule: true,
    default: class {
        canvas = { isConnected: true, setAttribute() {}, removeAttribute() {} }

        isAttached = true

        size = { width: 0, height: 0 }

        constructor(_element: unknown, events: HostEvents) {
            hostEvents.push(events)
        }

        destroy() {}
    }
}))

beforeEach(() => {
    hostEvents.length = 0
    jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    jest.restoreAllMocks()
    removeChartEnvironment()
})

describe('Guarding chart actions', () => {
    it('Should run actions while the chart works', () => {
        installChartEnvironment().create()
        hostEvents[0].onResize(100, 50, 1)

        expect(rendererCalls)
            .toContain('resize')
    })

    it('Should skip actions after the chart is destroyed', () => {
        const chart = installChartEnvironment().create()

        chart.destroy()
        rendererCalls.length = 0
        hostEvents[0].onResize(100, 50, 1)

        expect(rendererCalls)
            .toEqual([])
    })

    it('Should skip actions after a failure', () => {
        installChartEnvironment().create()
        rendererErrorHandlers[0](new Error('Boom'))
        rendererCalls.length = 0
        hostEvents[0].onResize(100, 50, 1)

        expect(rendererCalls)
            .not.toContain('resize')
    })
})
