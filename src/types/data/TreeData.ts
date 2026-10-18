import Value from '@/types/base/Value'
import TableData, { getValueRows } from '@/types/TableData'
import Data from '@/types/interfaces/Data'
import { ChartType } from '@/static/Enums'

export type TreeValue = Value & {
    sectors?: Value[]
}

class TreeData implements Data {
    type: ChartType

    values: TreeValue[]

    padding: number

    gap: number

    static getRows(data: TreeData): TableData {
        return getValueRows(data.values)
    }
}

export default TreeData