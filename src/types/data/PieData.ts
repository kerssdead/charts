import Sector from '@/types/Sector'
import Data from '@/types/interfaces/Data'

export default class PieData implements Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string
}