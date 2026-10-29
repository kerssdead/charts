import TableData, { getTotals, getValueRows } from '@/types/TableData'
import Formatter from '@/helpers/Formatter'
import { ChartType, Tag } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import PlotData, { getPlotRows } from '@/types/data/PlotData'
import TreeData, { getTreeSum } from '@/types/data/TreeData'
import TreeBarData, { getTreeBarRows } from '@/types/data/TreeBarData'
import TextResources from '@/static/TextResources'

export default class Decomposition {
    static fromCharts(charts: ChartItem[]) {
        const container = document.createElement(Tag.Div)

        for (const chart of charts)
            container.appendChild(Decomposition.toTable(Decomposition.getRows(chart)))

        return container
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

    static toTable(data: TableData) {
        const div = (className?: string, children: HTMLElement[] = []) => {
            const element = document.createElement(Tag.Div)

            if (className)
                element.classList.add(className)

            for (const child of children)
                element.append(child)

            return element
        }

        const text = (value: string) => {
            const element = div()

            element.textContent = value

            return element
        }

        const cell = (value: string, title: string = value) => {
            const element = text(value)

            element.title = title

            return element
        }

        const rows = data.values.map(row => {
            return div('o-table-row', [cell(row.name), ...data.headers.map(header => cell(Formatter.number(row.values.get(header.value) ?? 0)))])
        })

        const totals = getTotals(data).map(value => {
            const total = Formatter.number(value)

            return cell(total, `${ TextResources.total }: ${ total }`)
        })

        return div('o-table', [
            div('o-table-header', [div(), ...data.headers.map(header => text(header.display))]),
            div('o-table-body', rows),
            div('o-table-footer', [div(), ...totals])
        ])
    }
}