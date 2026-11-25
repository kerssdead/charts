import { hasLegend } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import Value from '@/types/base/Value'

const chart = (type: ChartType, count: number = 1) => {
    return { type, data: { values: Array.from({ length: count }, () => new Value()) } } as ChartItem
}

describe('Checking chart legend support', () => {
    it('Should support legend for plot and pie', () => {
        expect([hasLegend(chart(ChartType.Plot)), hasLegend(chart(ChartType.Pie))])
            .toEqual([true, true])
    })

    it('Should not support legend for gauge, segmented bar, tree bar and heat map', () => {
        const types = [ChartType.Gauge, ChartType.SegmentedBar, ChartType.TreeBar, ChartType.HeatMap]

        expect(types.map(type => hasLegend(chart(type))))
            .toEqual([false, false, false, false])
    })

    it('Should support legend for tree map only with several roots', () => {
        expect([hasLegend(chart(ChartType.TreeMap, 1)), hasLegend(chart(ChartType.TreeMap, 2))])
            .toEqual([false, true])
    })

    it('Should not support legend for unknown chart type', () => {
        expect(hasLegend(chart(-1 as unknown as ChartType)))
            .toBe(false)
    })
})