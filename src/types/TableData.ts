import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'
import Value from '@/types/base/Value'
import { sum } from '@/Helper'

export default interface TableData {
    headers: TableHeaderValue[]

    values: TableValue[]
}

export function getValueRows(values: Value[]): TableData {
    const key = 'Value'

    return {
        headers: [{ value: key, display: key }],
        values: values.map(value => ({ name: value.label, values: new Map([[key, value.value]]) }))
    }
}

export function getTotals(table: TableData): number[] {
    return table.headers.map(header => sum(table.values, row => Number(row.values.get(header.value) ?? 0)))
}