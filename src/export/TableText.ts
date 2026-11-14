import TableData from '@/types/TableData'
import TableValue from '@/types/TableValue'
import TextResources from '@/static/TextResources'
import { getTotals } from '@/export/TableTotals'

export function toTabSeparatedText(table: TableData): string {
    const clean = (value: string) => value.replace(/[\t\r\n]+/g, ' ')
    const getCells = (row: TableValue) => table.headers.map(header => `${ row.values.get(header.value) ?? '' }`)

    const lines = [
        ['', ...table.headers.map(header => clean(header.display))],
        ...table.values.map(row => [clean(row.name), ...getCells(row)]),
        [TextResources.total, ...getTotals(table).map(total => `${ total }`)]
    ]

    return lines.map(line => line.join('\t')).join('\n')
}