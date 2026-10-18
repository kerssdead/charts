import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'
import Value from '@/types/base/Value'
import { sum } from '@/helpers/Collections'
import TextResources from '@/static/TextResources'

export default interface TableData {
    headers: TableHeaderValue[]

    values: TableValue[]
}

export function getValueRows<T extends Value>(values: T[], getValue: (value: T) => number = value => value.value): TableData {
    const key = TextResources.value

    return {
        headers: [{ value: key, display: key }],
        values: values.map(value => ({ name: value.label, values: new Map([[key, getValue(value)]]) }))
    }
}

export function getTotals(table: TableData): number[] {
    return table.headers.map(header => sum(table.values, row => Number(row.values.get(header.value) ?? 0)))
}