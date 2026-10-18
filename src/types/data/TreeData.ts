import Value from '@/types/base/Value'
import Data from '@/types/interfaces/Data'
import { sum } from '@/helpers/Collections'

export type TreeValue = Value & {
    sectors?: Value[]
}

export default interface TreeData extends Data {
    values: TreeValue[]

    padding: number

    gap: number
}

export function getTreeSum(value: TreeValue) {
    return value.sectors?.length
           ? sum(value.sectors.filter(sector => sector.value > 0), sector => sector.value)
           : value.value
}