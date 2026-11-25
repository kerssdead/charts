import { hasFixedHeader } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'

const chart = (type: ChartType) => ({ type, data: { values: [] } }) as ChartItem

describe('Checking fixed header chart types', () => {
    it('Should have fixed header for tree bar', () => {
        expect(hasFixedHeader(chart(ChartType.TreeBar)))
            .toBe(true)
    })

    it.each([
        ChartType.Plot,
        ChartType.Pie,
        ChartType.TreeMap,
        ChartType.Gauge,
        ChartType.SegmentedBar,
        ChartType.HeatMap
    ])('Should not have fixed header for chart type %s', type => {
        expect(hasFixedHeader(chart(type)))
            .toBe(false)
    })

    it('Should not have fixed header for unknown chart type', () => {
        expect(hasFixedHeader(chart(-1 as unknown as ChartType)))
            .toBe(false)
    })
})