import PlotSeries from '@/types/PlotSeries'
import Data from '@/types/interfaces/Data'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'

export default interface PlotData extends Data {
    shortLabels: boolean
    simple: boolean
    yMax: number | undefined
    xTitle: string
    yTitle: string
    xType: PlotAxisType
    xScale?: PlotScaleType
    yScale?: PlotScaleType
    values: PlotSeries[]
    enableMerging: boolean
}