import Sector from 'types/Sector'
import Data from 'types/interfaces/Data'

class GaugeData implements Data {
    values: Sector[]

    max: number

    min: number
}

export default GaugeData