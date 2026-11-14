import { getTableRows, summarizeTable } from '@/charts/ChartDefinitions'
import ChartItem from '@/types/ChartItem'
import { ChartType, TableColumnKey } from '@/static/Enums'

const valueChart = (type: ChartType) => {
    return { type, data: { values: [{ label: 'a', value: 1 }, { label: 'b', value: 3 }] } } as unknown as ChartItem
}

const plotChart = (xs: number[]) => {
    return {
        type: ChartType.Plot,
        data: { values: [{ label: 's', values: xs.map(x => ({ x, y: x })) }] }
    } as unknown as ChartItem
}

const keys = (chart: ChartItem) => summarizeTable(chart, getTableRows(chart)).headers.map(header => header.value)

describe('Summarizing chart tables', () => {
    it('Should add a row total column to plots with several x values', () => {
        expect(keys(plotChart([1, 2])))
            .toEqual(['1', '2', TableColumnKey.RowTotal])
    })

    it('Should not add a row total column to plots with a single x value', () => {
        expect(keys(plotChart([1])))
            .toEqual(['1'])
    })

    it('Should add a share column to pie and tree map', () => {
        expect([keys(valueChart(ChartType.Pie)), keys(valueChart(ChartType.TreeMap))])
            .toEqual([['Value', TableColumnKey.Share], ['Value', TableColumnKey.Share]])
    })

    it.each([ChartType.Gauge, ChartType.SegmentedBar])('Should keep table of chart type %s unchanged', type => {
        expect(keys(valueChart(type)))
            .toEqual(['Value'])
    })

    it('Should keep table of unknown chart type unchanged', () => {
        const table = { headers: [{ value: 'a', display: 'a' }], values: [] }

        expect(summarizeTable(valueChart(-1 as ChartType), table))
            .toBe(table)
    })
})