import TableData from '@/types/TableData'
import Formatter from '@/helpers/Formatter'
import { ChartType, Tag } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData from '@/types/data/PlotData'
import PieData from '@/types/data/PieData'
import TreeData from '@/types/data/TreeData'
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

            case ChartType.TreeMap:
                return TreeData.getRows(chart.data as TreeData)

            default:
                return PieData.getRows(chart.data as PieData)
        }
    }

    static toTable(values: TableData) {
        let table = document.createElement(Tag.Div)

        table.classList.add('o-table')

        let totals = new Map<string, number>()
        let rows = '',
            headers = ''

        const tableRows = values.values.map(tableValue => {
            let allColumns = new Map<string, any>()

            for (const header of values.headers)
                allColumns.set(header.value, 0)

            for (const [key, value] of tableValue.values)
                allColumns.set(key, value)

            return { name: tableValue.name, columns: allColumns }
        })

        for (const tableHeader of values.headers)
            headers += `
                <div>
                    ${ escapeHtml(tableHeader.display) }
                </div>
            `

        for (const { name, columns: value } of tableRows) {
            let columns = ''

            for (const [vKey, vValue] of value) {
                const text = vValue == undefined ? '' : Formatter.number(vValue)

                columns += `
                    <div title="${ text }">
                        ${ text }
                    </div>
                `

                if (totals.has(vKey)) {
                    let totalValue = +(totals.get(vKey) ?? 0)
                    totals.set(vKey, totalValue + +vValue)
                } else {
                    totals.set(vKey, vValue)
                }
            }

            const k = escapeHtml(name)

            rows += `
                <div class="o-table-row">
                    <div title="${ k }">
                        ${ k }
                    </div>
                    
                    ${ columns }
                </div>
            `
        }

        let totalColumns = ''

        for (const [, value] of totals) {
            const total = value == undefined ? '' : Formatter.number(value)

            totalColumns += `
                <div title="${ value == undefined ? '' : `Total: ${ total }` }">
                    ${ total }
                </div>
            `
        }

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

                ${ totalColumns }
            </div>
        `

        return table
    }
}

export default Decomposition