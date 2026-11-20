import { installChartEnvironment, installEnvironmentListeners, removeChartEnvironment } from './ChartTestData'
import { rendererCalls } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

afterEach(() => {
    removeChartEnvironment()
})

describe('Suspending chart', () => {
    it('Should suspend the renderer when the canvas is detached', () => {
        const { canvas, observer, create } = installChartEnvironment()

        create()
        canvas().remove()
        observer().callback([])

        expect(rendererCalls)
            .toContain('suspend')
    })

    it('Should release font and motion listeners when the canvas is detached', () => {
        const { canvas, observer, create } = installChartEnvironment()
        const listeners = installEnvironmentListeners()

        create()
        canvas().remove()
        observer().callback([])

        expect(listeners.count())
            .toBe(0)
    })

    it('Should not suspend while the canvas stays attached', () => {
        const { observer, create } = installChartEnvironment()

        create()
        observer().callback([])

        expect(rendererCalls)
            .not.toContain('suspend')
    })
})