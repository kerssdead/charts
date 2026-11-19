import { installChartEnvironment, removeChartEnvironment } from './ChartTestData'
import { rendererCalls, rendererErrorHandlers } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    jest.restoreAllMocks()
    removeChartEnvironment()
})

describe('Destroying chart', () => {
    it('Should destroy the renderer', () => {
        const chart = installChartEnvironment().create()

        chart.destroy()

        expect(rendererCalls)
            .toContain('destroy')
    })

    it('Should destroy the renderer only once', () => {
        const chart = installChartEnvironment().create()

        chart.destroy()
        chart.destroy()

        expect(rendererCalls.filter(call => call === 'destroy'))
            .toHaveLength(1)
    })

    it('Should stop reacting to system theme changes', () => {
        const { changeTheme, create } = installChartEnvironment()
        const chart = create()

        chart.destroy()
        rendererCalls.length = 0
        changeTheme(true)

        expect(rendererCalls)
            .toEqual([])
    })

    it('Should not suspend afterwards', () => {
        const { canvas, observer, create } = installChartEnvironment()
        const chart = create()

        chart.destroy()
        rendererCalls.length = 0
        canvas()?.remove()
        observer()?.callback([])

        expect(rendererCalls)
            .not.toContain('suspend')
    })

    it('Should not render afterwards', () => {
        const chart = installChartEnvironment().create()

        chart.destroy()
        rendererCalls.length = 0
        chart.render()

        expect(rendererCalls)
            .toEqual([])
    })

    it('Should clear a reported failure', () => {
        const { host, create } = installChartEnvironment()
        const chart = create()

        rendererErrorHandlers[0](new Error('Boom'))

        expect(host.elements)
            .toHaveLength(1)

        chart.destroy()

        expect(host.elements)
            .toHaveLength(0)
    })
})