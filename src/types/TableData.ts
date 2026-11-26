import TableValue from '@/types/TableValue'
import TableHeaderValue from '@/types/TableHeaderValue'

export default interface TableData {
    headers: TableHeaderValue[]
    values: TableValue[]
}