import { ChartType, LegendPlace, LineDrawMode, PlotAxisType, PlotScaleType, PlotType } from '@/static/Enums'

const legacyOrders = [
    [ChartType, ['plot', 'pie', 'gauge', 'tree-map', 'segmented-bar', 'tree-bar']],
    [LegendPlace, ['bottom', 'left', 'top', 'right']],
    [PlotAxisType, ['number', 'date', 'text']],
    [PlotType, ['line', 'attention-line', 'column', 'bar', 'stacking-column', 'area']],
    [LineDrawMode, ['straight', 'smooth']],
    [PlotScaleType, ['category', 'linear', 'log']]
] as const

const load = () => {
    let parse!: typeof import('@/helpers/EnumInput').parseEnumInput

    jest.isolateModules(() => {
        parse = require('@/helpers/EnumInput').parseEnumInput
    })

    return parse
}

describe('Parsing enum input', () => {
    let warn: jest.SpyInstance

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        warn.mockRestore()
    })

    it.each(legacyOrders)('Should map legacy numbers to values of %#', (values, expected) => {
        expect(expected.map((_, index) => load()(values as Record<string, string>, index)))
            .toEqual(expected)
    })

    it('Should keep string values', () => {
        expect(load()(ChartType, 'tree-map'))
            .toBe(ChartType.TreeMap)
    })

    it('Should keep undefined', () => {
        expect(load()(ChartType, undefined))
            .toBeUndefined()
    })

    it('Should keep unknown numbers', () => {
        expect(load()(ChartType, 99))
            .toBe(99)
    })

    it('Should warn about numeric values once', () => {
        const parse = load()

        parse(ChartType, 1)
        parse(ChartType, 2)

        expect(warn)
            .toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0][1])
            .toContain("use 'pie' instead of 1")
    })

    it('Should not warn about string values', () => {
        load()(ChartType, 'pie')

        expect(warn)
            .not.toHaveBeenCalled()
    })
})