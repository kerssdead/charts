import TableData, { getTotals, getValueRows } from '@/types/TableData'
import Formatter from '@/helpers/Formatter'
import { ChartType, Tag } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData from '@/types/data/PlotData'
import { escapeHtml } from '@/Helper'

class Decomposition {
    static fromCharts(charts: ChartItem[]) {
        const container = document.createElement(Tag.Div)

        for (const chart of charts)
            container.appendChild(Decomposition.toTable(Decomposition.getRows(chart)))

        return container
    }

    static getRows(chart: ChartItem): TableData {
        switch (chart.type) {
            case ChartType.Plot:
                return PlotData.getRows(chart.data as PlotData)

            default:
                return getValueRows(chart.data.values)
        }
    }

    static toTable(data: TableData) {
        const table = document.createElement(Tag.Div)

        table.classList.add('o-table')

        const cell = (text: string, title: string = text) => `<div title="${ title }">${ text }</div>`

        const headers = data.headers.map(header => `<div>${ escapeHtml(header.display) }</div>`).join('')

        const rows = data.values.map(row => {
            const columns = data.headers.map(header => cell(Formatter.number(row.values.get(header.value) ?? 0))).join('')

            return `<div class="o-table-row">${ cell(escapeHtml(row.name)) }${ columns }</div>`
        }).join('')

        const totals = getTotals(data).map(value => {
            const total = Formatter.number(value)

            return cell(total, `Total: ${ total }`)
        }).join('')

        table.innerHTML = `
            <div class="o-table-header">
                <div></div>
                ${ headers }
            </div>
            <div class="o-table-body">
                ${ rows }
            </div>
            <div class="o-table-footer">
                <div></div>
                ${ totals }
            </div>
        `

        return table
    }
}

export default Decomposition