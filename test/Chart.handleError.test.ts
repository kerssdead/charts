import TextResources from '@/static/TextResources'
import { Tag } from '@/static/Enums'
import {
    chartSettings,
    installChartEnvironment,
    removeChartEnvironment
} from './ChartTestData'
import { rendererCalls, rendererErrorHandlers, rendererFailures } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    jest.restoreAllMocks()
    removeChartEnvironment()
})

describe('Handling chart errors', () => {
    it('Should show the failure when the renderer reports an error', () => {
        const { host, create } = installChartEnvironment()

        create()
        rendererErrorHandlers[0](new Error('Boom'))

        expect(host.elements.map(element => element.tagName))
            .toEqual([Tag.Div])
        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
    })

    it('Should pass the error to onError', () => {
        const { create } = installChartEnvironment()
        const onError = jest.fn()
        const error = new Error('Boom')

        create(chartSettings({ onError }))
        rendererErrorHandlers[0](error)

        expect(onError)
            .toHaveBeenCalledWith(error)
    })

    it('Should report only the first error', () => {
        const { create } = installChartEnvironment()
        const onError = jest.fn()

        create(chartSettings({ onError }))
        rendererErrorHandlers[0](new Error('First'))
        rendererErrorHandlers[0](new Error('Second'))

        expect(onError)
            .toHaveBeenCalledTimes(1)
    })

    it('Should log a failure while stopping and still show the failure', () => {
        const { host, create } = installChartEnvironment()
        const stopError = new Error('Stop failed')

        create()
        rendererFailures.destroy = stopError
        rendererErrorHandlers[0](new Error('Boom'))

        expect(console.error)
            .toHaveBeenCalledWith(stopError)
        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
    })

    it('Should stop the renderer when an error is reported', () => {
        const { create } = installChartEnvironment()

        create()
        rendererErrorHandlers[0](new Error('Boom'))

        expect(rendererCalls)
            .toContain('destroy')
    })

    it('Should ignore resize after a failure', () => {
        const { host, observer, create } = installChartEnvironment()

        create()
        rendererErrorHandlers[0](new Error('Boom'))
        rendererCalls.length = 0
        observer().callback([{ target: host, contentRect: { width: 100, height: 50 } }])

        expect(rendererCalls)
            .not.toContain('resize')
    })

    it('Should ignore resize after the chart is destroyed', () => {
        const { host, observer, create } = installChartEnvironment()
        const chart = create()

        chart.destroy()
        rendererCalls.length = 0
        observer().callback([{ target: host, contentRect: { width: 100, height: 50 } }])

        expect(rendererCalls)
            .not.toContain('resize')
    })

    it('Should show the failure when the canvas host cannot be created', () => {
        const { host, create } = installChartEnvironment()

        Object.assign(globalThis, {
            ResizeObserver: class {
                constructor() {
                    throw new Error('No observer')
                }
            }
        })
        create()

        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
    })
})