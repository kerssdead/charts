import { getChartDefinition } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'

describe('Getting chart definitions', () => {
    it.each([
        ChartType.Plot,
        ChartType.Pie,
        ChartType.TreeMap,
        ChartType.Gauge,
        ChartType.SegmentedBar,
        ChartType.TreeBar
    ])('Should define chart type %s', type => {
        expect(getChartDefinition(type))
            .toBeDefined()
    })

    it('Should not define unknown chart type', () => {
        expect(getChartDefinition(-1 as ChartType))
            .toBeUndefined()
    })
})