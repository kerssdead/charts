import TableValue from 'types/TableValue'
import Sector from 'types/Sector'
import TableData from 'types/TableData'
import Data from 'types/interfaces/Data'
import data from "types/interfaces/Data";
import value from "../base/Value";
import {types} from "sass";
import Map = types.Map;
import {ChartType, ErrorType} from "../../static/Enums";
import Errors from "../../helpers/Errors";

export class PieData implements Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string

    static getRows(data: PieData): TableData {
        Errors.throw(ErrorType.NotImplemented)

        // const key = 'Value'
        //
        // let values: TableValue[] = []
        //
        // for (const value of data.values)
        //     values.push({
        //         name: value.label,
        //         values: new Map([[key, value.value]])
        //     })
        //
        // return {
        //     headers: [
        //         {
        //             value: key,
        //             display: key
        //         }
        //     ],
        //     values: values
        // }
    }

    type: ChartType

    recalculate(): void {
        Errors.throw(ErrorType.NotImplemented)
    }
}