import HeatMapCell from '@/types/HeatMapCell'
import Data from '@/types/interfaces/Data'

export type HeatMapResolution = number | {
    columns: number
    rows: number
}

export default interface HeatMapData extends Data {
    values: HeatMapCell[]

    xLabels: string[]

    yLabels: string[]

    color: string

    colors?: string[]

    smooth?: boolean

    alive?: boolean

    radius?: number

    xTitle?: string

    yTitle?: string

    disableAxes?: boolean

    image?: string

    width?: number

    height?: number

    resolution?: HeatMapResolution

    opacity?: number
}

export function isPointData(data: HeatMapData) {
    return data.resolution != null
}