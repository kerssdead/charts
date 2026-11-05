import { withShares } from '@/types/TableData'
import { TableColumnKey } from '@/static/Enums'
import TextResources from '@/static/TextResources'
import TableValue from '@/types/TableValue'

const row = (value: number, extra: Partial<TableValue> = {}): TableValue => {
    return { name: `${ value }`, values: new Map([['value', value]]), ...extra }
}

const shares = (values: TableValue[]) => {
    return withShares({ headers: [{ value: 'value', display: 'Value' }], values }, 'value')
        .values
        .map(row => row.values.get(TableColumnKey.Share))
}

describe('Adding shares to a table', () => {
    it('Should append a percent share column header', () => {
        const table = withShares({ headers: [{ value: 'value', display: 'Value' }], values: [] }, 'value')

        expect(table.headers.at(-1))
            .toEqual({ value: TableColumnKey.Share, display: TextResources.share, percent: true })
    })

    it('Should compute each share of the total in percent', () => {
        expect(shares([row(1), row(3)]))
            .toEqual([25, 75])
    })

    it('Should give zero share to disabled rows and exclude them from the total', () => {
        expect(shares([row(1), row(6, { disabled: true }), row(3)]))
            .toEqual([25, 0, 75])
    })

    it('Should compute the total from top level rows only', () => {
        expect(shares([row(4), row(1, { level: 1 }), row(4)]))
            .toEqual([50, 12.5, 50])
    })

    it('Should give zero shares when the total is zero', () => {
        expect(shares([row(0), row(0)]))
            .toEqual([0, 0])
    })
})