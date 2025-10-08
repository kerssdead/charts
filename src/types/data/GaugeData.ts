import { Sector } from '../Sector'
import { Data } from '../interfaces/Data'

export class GaugeData implements Data {
    values: Sector[]

    max: number
}