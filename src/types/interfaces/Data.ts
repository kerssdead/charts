import Value from '@/types/base/Value'
import { ChartType } from '@/static/Enums'

interface Data {
    type: ChartType

    values: Value[]
}

export default Data