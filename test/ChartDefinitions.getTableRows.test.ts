import { getTableRows } from '@/charts/ChartDefinitions'
import { getHeatMapRows, getPlotRows, getTreeBarRows, getValueRows } from '@/export/TableRows'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData from '@/types/data/PlotData'
import TreeBarData from '@/types/data/TreeBarData'
import Sector from '@/types/Sector'
import PlotSeries from '@/types/PlotSeries'
import TreeBarRow from '@/types/TreeBarRow'
import { isDisabledByFlag } from './ViewStateTestData'
import { heatMapData } from './HeatMapTestData'

const sectors = () => [new Sector({ label: 'a', value: 1 }), new Sector({ label: 'b', value: 3 })]

describe('Getting chart table rows', () => {
    it.each([ChartType.Pie, ChartType.Gauge, ChartType.SegmentedBar])(
        'Should get value rows for chart type %s',
        type => {
            const chart = { type, data: { values: sectors() } } as ChartItem

            expect(getTableRows(chart, isDisabledByFlag))
                .toEqual(getValueRows(chart.data.values, isDisabledByFlag))
        }
    )

    it('Should sum positive sectors of tree map values', () => {
        const values = [new Sector({ label: 'a', value: 9, sectors: [new Sector({ value: 2 }), new Sector({ value: -1 })] })]

        expect(getTableRows({ type: ChartType.TreeMap, data: { values } }, isDisabledByFlag).values[0].values.get('Value'))
            .toBe(2)
    })

    it('Should get plot rows for plot', () => {
        const data = { values: [new PlotSeries({ label: 's', values: [{ x: 1, y: 2 }] })] } as PlotData

        expect(getTableRows({ type: ChartType.Plot, data }, isDisabledByFlag))
            .toEqual(getPlotRows(data, isDisabledByFlag))
    })

    it('Should get tree bar rows for tree bar', () => {
        const data = { values: [new TreeBarRow({ label: 'a', parts: sectors() })] } as TreeBarData

        expect(getTableRows({ type: ChartType.TreeBar, data }, isDisabledByFlag))
            .toEqual(getTreeBarRows(data, isDisabledByFlag))
    })

    it('Should get grid rows for heat map', () => {
        const data = heatMapData({ values: [{ x: 'a', y: 'p', value: 1 }, { x: 'b', y: 'p', value: 2 }] })

        expect(getTableRows({ type: ChartType.HeatMap, data }, isDisabledByFlag))
            .toEqual(getHeatMapRows(data, isDisabledByFlag))
    })

    it('Should mark rows disabled by the given check', () => {
        const table = getTableRows({ type: ChartType.Pie, data: { values: sectors() } }, value => value.label === 'b')

        expect(table.values.map(row => row.disabled))
            .toEqual([false, true])
    })

    it('Should get empty table for unknown chart type', () => {
        expect(getTableRows({ type: -1 as unknown as ChartType, data: { values: sectors() } }, isDisabledByFlag))
            .toEqual({ headers: [], values: [] })
    })
})