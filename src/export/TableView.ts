import TableData, { getMatchingValues, getTotals } from '@/types/TableData'
import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'
import Formatter from '@/helpers/Formatter'
import TextResources from '@/static/TextResources'
import { AriaRole, Attribute, TableClasses, Tag } from '@/static/Enums'
import { asNumberCell, cell, div } from '@/export/TableElements'
import TableSorting from '@/export/TableSorting'
import TableColumnHighlight from '@/export/TableColumnHighlight'

function formatValue(value: number, header: TableHeaderValue, decimals: number | undefined) {
    const text = Formatter.number(value, decimals)

    return header.percent ? `${ text }%` : text
}

function nameCell(value: TableValue) {
    const element = div(undefined, [], AriaRole.RowHeader)

    element.title = value.name

    if (value.level)
        element.style.setProperty('--o-level', `${ value.level }`)

    if (value.color) {
        const swatch = document.createElement(Tag.Span)

        swatch.classList.add(TableClasses.Swatch)
        swatch.setAttribute(Attribute.AriaHidden, 'true')
        swatch.style.color = value.color

        element.append(swatch)
    }

    element.append(value.name)

    return element
}

export default class TableView {
    readonly element: HTMLElement

    private readonly data: TableData

    private readonly decimals: number | undefined

    private readonly rowElements: HTMLElement[] = []

    private totalElements: HTMLElement[] = []

    constructor(data: TableData, decimals?: number) {
        this.data = data
        this.decimals = decimals
        this.element = this.build()
    }

    filter(query: string) {
        const matching = getMatchingValues(this.data.values, query)

        for (const [index, rowElement] of this.rowElements.entries())
            rowElement.hidden = !matching.has(this.data.values[index])

        this.showTotals(this.data.values.filter(value => matching.has(value)))
    }

    private build() {
        const table = div(TableClasses.Table, [], AriaRole.Table)
        const headerRow = this.buildHeaderRow()

        table.style.setProperty('--o-value-columns', `${ Math.max(this.data.headers.length, 1) }`)

        if (this.data.headers.length === 0 || this.data.values.length === 0) {
            table.append(headerRow, this.buildEmptyBody())

            return table
        }

        for (const row of this.data.values)
            this.rowElements.push(this.buildRow(row))

        const body = div(TableClasses.Body, this.rowElements, AriaRole.RowGroup)

        table.append(headerRow, body, this.buildFooterRow())

        TableSorting.attach(headerRow, body, this.data, this.rowElements)
        TableColumnHighlight.attach(table)

        return table
    }

    private buildHeaderRow() {
        return div(TableClasses.Header, [
            cell(TextResources.name, AriaRole.ColumnHeader),
            ...this.data.headers.map(header => asNumberCell(cell(header.display, AriaRole.ColumnHeader)))
        ], AriaRole.Row)
    }

    private buildEmptyBody() {
        const empty = cell(TextResources.noData)

        empty.classList.add(TableClasses.Empty)

        return div(TableClasses.Body, [div(TableClasses.Row, [empty], AriaRole.Row)], AriaRole.RowGroup)
    }

    private buildRow(row: TableValue) {
        const valueCell = (header: TableHeaderValue) => {
            const value = row.values.get(header.value)

            return asNumberCell(cell(value === undefined ? '' : formatValue(value, header, this.decimals)))
        }

        const element = div(TableClasses.Row, [nameCell(row), ...this.data.headers.map(valueCell)], AriaRole.Row)

        if (row.disabled)
            element.classList.add(TableClasses.Disabled)

        return element
    }

    private buildFooterRow() {
        this.totalElements = this.data.headers.map(() => asNumberCell(cell('')))

        this.showTotals(this.data.values)

        return div(
            TableClasses.Footer,
            [cell(TextResources.total, AriaRole.RowHeader), ...this.totalElements],
            AriaRole.Row
        )
    }

    private showTotals(values: TableValue[]) {
        const totals = getTotals({ headers: this.data.headers, values })

        for (const [index, element] of this.totalElements.entries()) {
            const total = formatValue(totals[index], this.data.headers[index], this.decimals)

            element.textContent = total
            element.title = `${ TextResources.total }: ${ total }`
        }
    }
}