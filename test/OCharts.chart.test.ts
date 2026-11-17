import ChartSettings from '@/types/ChartSettings'
import { ChartType, LegendPlace } from '@/static/Enums'

const mockChart = jest.fn()

jest.mock('@/Chart', () => ({
    __esModule: true,
    default: function(...args: unknown[]) {
        mockChart(...args)
    }
}))

const load = () => {
    let OCharts!: typeof import('@/OCharts').default

    jest.isolateModules(() => {
        OCharts = require('@/OCharts').default
    })

    return OCharts
}

describe('Creating chart through OCharts', () => {
    beforeEach(() => {
        Object.assign(globalThis, { window: {} })
        mockChart.mockClear()
    })

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window
    })

    it('Should create a chart for the element and settings', () => {
        const element = {} as HTMLElement
        const settings = {} as ChartSettings

        load().chart(element, settings)

        expect(mockChart)
            .toHaveBeenCalledWith(element, settings)
    })

    it('Should expose OCharts on the window', () => {
        const OCharts = load()

        expect((window as unknown as { OCharts: unknown }).OCharts)
            .toBe(OCharts)
    })

    it('Should expose chart and legend enums', () => {
        const module = require('@/OCharts')

        expect([module.ChartType.Plot, module.LegendPlace.Top])
            .toEqual([ChartType.Plot, LegendPlace.Top])
    })

    it('Should be callable as a plain function', () => {
        expect(() => load()())
            .not.toThrow()
    })
})