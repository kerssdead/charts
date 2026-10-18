import Sector from '@/types/Sector'
import TableData, { getValueRows } from '@/types/TableData'
import Data from '@/types/interfaces/Data'
import { ChartType } from '@/static/Enums'

export default class PieData implements Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string

    static getRows(data: PieData): TableData {
        return getValueRows(data.values)
    }

    type: ChartType
}