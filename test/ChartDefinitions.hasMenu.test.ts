import { hasMenu } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'

const chart = (type: ChartType) => ({ type, data: { values: [] } }) as ChartItem

describe('Checking chart menu support', () => {
    it.each([
        ChartType.Plot,
        ChartType.Pie,
        ChartType.TreeMap,
        ChartType.Gauge,
        ChartType.TreeBar
    ])('Should have menu for chart type %s', type => {
        expect(hasMenu(chart(type)))
            .toBe(true)
    })

    it('Should not have menu for segmented bar', () => {
        expect(hasMenu(chart(ChartType.SegmentedBar)))
            .toBe(false)
    })

    it('Should not have menu for unknown chart type', () => {
        expect(hasMenu(chart(-1 as unknown as ChartType)))
            .toBe(false)
    })
})