import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import Data from '@/types/interfaces/Data'

export default interface SegmentedBarData extends Data {
    values: Sector[]

    stops: SegmentedBarStop[]

    leftLabel?: string

    rightLabel?: string
}
