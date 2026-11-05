import { withRowTotals } from '@/types/TableData'
import { TableColumnKey } from '@/static/Enums'
import TextResources from '@/static/TextResources'

describe('Adding row totals to a table', () => {
    it('Should keep the table with a single column', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }],
            values: [{ name: 'One', values: new Map([['a', 1]]) }]
        }

        expect(withRowTotals(table))
            .toBe(table)
    })

    it('Should append a total column header', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }, { value: 'b', display: 'B' }],
            values: []
        }

        expect(withRowTotals(table).headers.at(-1))
            .toEqual({ value: TableColumnKey.RowTotal, display: TextResources.total })
    })

    it('Should sum each row treating missing values as zero', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }, { value: 'b', display: 'B' }],
            values: [
                { name: 'One', values: new Map([['a', 1], ['b', 2]]) },
                { name: 'Two', values: new Map([['b', 5]]) }
            ]
        }

        expect(withRowTotals(table).values.map(row => row.values.get(TableColumnKey.RowTotal)))
            .toEqual([3, 5])
    })

    it('Should keep row properties and not mutate the source', () => {
        const source = { name: 'One', color: '#ff0000', level: 1, disabled: true, values: new Map([['a', 1], ['b', 2]]) }
        const table = { headers: [{ value: 'a', display: 'A' }, { value: 'b', display: 'B' }], values: [source] }

        const row = withRowTotals(table).values[0]

        expect([row.name, row.color, row.level, row.disabled, source.values.has(TableColumnKey.RowTotal)])
            .toEqual(['One', '#ff0000', 1, true, false])
    })
})