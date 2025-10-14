import { Sector } from 'types/Sector'
import { Data } from 'types/interfaces/Data'

export class GaugeData implements Data {
    values: Sector[]

    max: number
}