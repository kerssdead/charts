import Data from 'types/interfaces/Data'
import DropdownItem from 'types/DropdownItem'
import { ChartType, LegendPlace } from 'static/Enums'
import ChartItem from 'types/ChartItem'

export default class ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    enableMove: boolean

    disableInitAnimation: boolean

    disableInteractions: boolean

    enableDebugMode: boolean

    width: number

    height: number

    minWidth: number | undefined

    minHeight: number | undefined

    baseColor: string

    title: string

    templateId: string

    valuePostfix: string | undefined

    legendPlace: LegendPlace

    data: Data

    type: ChartType = ChartType.Plot

    charts: ChartItem[]

    columns?: number

    contextMenu?: DropdownItem[]

    isDarkThemeFunction: Function | undefined
}