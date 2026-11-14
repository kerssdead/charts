import { getTableRows } from '@/charts/ChartDefinitions'
import { getPlotRows, getTreeBarRows, getValueRows } from '@/export/TableRows'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData from '@/types/data/PlotData'
import TreeBarData from '@/types/data/TreeBarData'
import Sector from '@/types/Sector'
import PlotSeries from '@/types/PlotSeries'
import TreeBarRow from '@/types/TreeBarRow'

const sectors = () => [new Sector({ label: 'a', value: 1 }), new Sector({ label: 'b', value: 3 })]

describe('Getting chart table rows', () => {
    it.each([ChartType.Pie, ChartType.Gauge, ChartType.SegmentedBar])(
        'Should get value rows for chart type %s',
        type => {
            const chart = { type, data: { values: sectors() } } as ChartItem

            expect(getTableRows(chart))
                .toEqual(getValueRows(chart.data.values))
        }
    )

    it('Should sum positive sectors of tree map values', () => {
        const values = [new Sector({ label: 'a', value: 9, sectors: [new Sector({ value: 2 }), new Sector({ value: -1 })] })]

        expect(getTableRows({ type: ChartType.TreeMap, data: { values } }).values[0].values.get('Value'))
            .toBe(2)
    })

    it('Should get plot rows for plot', () => {
        const data = { values: [new PlotSeries({ label: 's', values: [{ x: 1, y: 2 }] })] } as PlotData

        expect(getTableRows({ type: ChartType.Plot, data }))
            .toEqual(getPlotRows(data))
    })

    it('Should get tree bar rows for tree bar', () => {
        const data = { values: [new TreeBarRow({ label: 'a', parts: sectors() })] } as TreeBarData

        expect(getTableRows({ type: ChartType.TreeBar, data }))
            .toEqual(getTreeBarRows(data))
    })

    it('Should get empty table for unknown chart type', () => {
        expect(getTableRows({ type: -1 as ChartType, data: { values: sectors() } }))
            .toEqual({ headers: [], values: [] })
    })
})