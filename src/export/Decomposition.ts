import TableData, { getValueRows, toTabSeparatedText, withRowTotals, withShares } from '@/types/TableData'
import { ChartType, TableClasses } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData, { getPlotRows } from '@/types/data/PlotData'
import TreeData, { getTreeSum } from '@/types/data/TreeData'
import TreeBarData, { getTreeBarRows } from '@/types/data/TreeBarData'
import TextResources from '@/static/TextResources'
import TableView from '@/export/TableView'
import TableToolbar from '@/export/TableToolbar'
import { caption, div } from '@/export/TableElements'

const FILTER_MIN_ROWS = 10

export default class Decomposition {
    static fromCharts(charts: ChartItem[], onSave: () => void) {
        const tables = charts.map(chart => Decomposition.getDisplayRows(chart))
        const views = tables.map(table => new TableView(table))

        const list = div(TableClasses.List, views.map((view, index) => {
            const chartTitle = charts[index].title

            return charts.length > 1 && chartTitle
                   ? div(TableClasses.Group, [caption(chartTitle), view.element])
                   : view.element
        }))

        const toolbar = TableToolbar.create({
            canFilter: tables.some(table => table.values.length > FILTER_MIN_ROWS),
            onFilter: query => {
                for (const view of views)
                    view.filter(query)
            },
            getText: () => tables.map(toTabSeparatedText).join('\n\n'),
            onSave
        })

        return div(TableClasses.Tables, [toolbar, list])
    }

    static getDisplayRows(chart: ChartItem): TableData {
        const table = Decomposition.getRows(chart)

        switch (chart.type) {
            case ChartType.Plot:
                return withRowTotals(table)

            case ChartType.Pie:
            case ChartType.TreeMap:
                return withShares(table, TextResources.value)

            default:
                return table
        }
    }

    static getRows(chart: ChartItem): TableData {
        switch (chart.type) {
            case ChartType.Plot:
                return getPlotRows(chart.data as PlotData)

            case ChartType.TreeMap:
                return getValueRows((chart.data as TreeData).values, getTreeSum)

            case ChartType.TreeBar:
                return getTreeBarRows(chart.data as TreeBarData)

            default:
                return getValueRows(chart.data.values)
        }
    }
}