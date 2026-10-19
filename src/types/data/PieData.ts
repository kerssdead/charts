import Sector from '@/types/Sector'
import Data from '@/types/interfaces/Data'

export default interface PieData extends Data {
    values: Sector[]

    innerRadius: number

    innerTitle: string
}