import {ChartType} from "static/Enums"
import Sector from 'types/Sector'
import Data from 'types/interfaces/Data'

export default class GaugeData implements Data {
    type: ChartType

    recalculate(): void {
        throw new Error("Method not implemented.")
    }

    values: Sector[]

    max: number

    min: number
}