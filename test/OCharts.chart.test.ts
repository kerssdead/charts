import ChartOptions from '@/types/ChartOptions'
import {
    ChartType,
    LegendPlace,
    LineDrawMode,
    PlotAxisType,
    PlotScaleType,
    PlotType
} from '@/static/Enums'

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
        const settings = {} as ChartOptions

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

    it('Should expose plot enums', () => {
        const module = require('@/OCharts')

        expect([
            module.PlotType.Line,
            module.PlotAxisType.Number,
            module.PlotScaleType.Linear,
            module.LineDrawMode.Straight
        ]).toEqual([
            PlotType.Line,
            PlotAxisType.Number,
            PlotScaleType.Linear,
            LineDrawMode.Straight
        ])
    })

    it('Should accept minimal single and multiple chart options', () => {
        const single: ChartOptions = { data: { values: [] } }
        const multiple: ChartOptions = { charts: [{ data: { values: [] } }], columns: 2 }

        load().chart({} as HTMLElement, single)
        load().chart({} as HTMLElement, multiple)

        expect(mockChart)
            .toHaveBeenCalledTimes(2)
    })

    it('Should reject mixing single chart and charts options', () => {
        // @ts-expect-error charts and data are alternatives
        const mixed: ChartOptions = { data: { values: [] }, charts: [] }

        expect(mixed)
            .toBeDefined()
    })
})