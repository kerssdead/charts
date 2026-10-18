import Value from '@/types/base/Value'
import Data from '@/types/interfaces/Data'

export type TreeValue = Value & {
    sectors?: Value[]
}

class TreeData implements Data {
    values: TreeValue[]

    padding: number

    gap: number
}

export default TreeData