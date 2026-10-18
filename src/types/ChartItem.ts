import Data from '@/types/interfaces/Data'
import { ChartType } from '@/static/Enums'

export default class ChartItem {
    type: ChartType

    data: Data

    title?: string
}