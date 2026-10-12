import TableValue from 'types/TableValue'
import Sector from 'types/Sector'
import TableData from 'types/TableData'
import Data from 'types/interfaces/Data'
import {ChartType, ErrorType} from "../../static/Enums";
import Errors from "../../helpers/Errors";

export default class PieData implements Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string

    // todo: fix decomposition to table
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

    recalculate(): void {
        Errors.throw(ErrorType.NotImplemented)
    }
}