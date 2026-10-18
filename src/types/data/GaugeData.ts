import Sector from '@/types/Sector'
import Data from '@/types/interfaces/Data'

export default class GaugeData implements Data {
    values: Sector[]

    max: number

    min: number

    innerRadius: number

    enableTrack: boolean
}