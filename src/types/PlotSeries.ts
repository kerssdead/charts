import Value from '@/types/base/Value'
import PlotPoint from '@/types/PlotPoint'
import { LineDrawMode, PlotType } from '@/static/Enums'

export default class PlotSeries extends Value {
    label!: string

    values!: PlotPoint[]

    type!: PlotType

    width?: number

    dash?: number[]

    drawMode?: LineDrawMode

    canToggle(): boolean {
        return true
    }
}