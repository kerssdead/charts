import TableValue from 'types/TableValue'
import Sector from 'types/Sector'
import TableData from 'types/TableData'
import Data from 'types/interfaces/Data'
import { ChartType } from "static/Enums"

export default class PieData implements Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string

    static getRows(data: PieData): TableData {
        const key = 'Value'

        let values: TableValue[] = []

        for (const value of data.values)
            values.push({
                name: value.label,
                values: new Map([[key, value.value]]),
            })

        return {
            headers: [
                {
                    value: key,
                    display: key
                }
            ],
            values: values
        }
    }

    type: ChartType
}