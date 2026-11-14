import { toTabSeparatedText } from '@/export/TableText'
import { TableClasses } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import TableView from '@/export/TableView'
import TableToolbar from '@/export/TableToolbar'
import { caption, div } from '@/export/TableElements'
import { getTableRows, summarizeTable } from '@/charts/ChartDefinitions'

const FILTER_MIN_ROWS = 10

export default class Decomposition {
    static fromCharts(charts: ChartItem[], onSave: () => void, decimals?: number) {
        const tables = charts.map(chart => summarizeTable(chart, getTableRows(chart)))
        const views = tables.map(table => new TableView(table, decimals))

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
}