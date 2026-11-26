import { getChartDefinition } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'
import UnknownDefinition from '@/charts/UnknownDefinition'

describe('Getting chart definitions', () => {
    it.each([
        ChartType.Plot,
        ChartType.Pie,
        ChartType.TreeMap,
        ChartType.Gauge,
        ChartType.SegmentedBar,
        ChartType.TreeBar,
        ChartType.HeatMap
    ])('Should define chart type %s', type => {
        expect(getChartDefinition(type))
            .not.toBe(UnknownDefinition)
    })

    it('Should fall back to the unknown definition for unknown chart type', () => {
        expect(getChartDefinition(-1 as unknown as ChartType))
            .toBe(UnknownDefinition)
    })
})