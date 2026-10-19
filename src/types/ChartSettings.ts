import Data from '@/types/interfaces/Data'
import DropdownItem from '@/types/DropdownItem'
import { ChartType, LegendPlace } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'

export default interface ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    enableMove: boolean

    staticMode: boolean

    disableInteractions: boolean

    enableDebugMode: boolean

    baseColor: string

    title: string

    templateId: string

    valuePostfix: string | undefined

    legendPlace: LegendPlace

    data: Data

    type: ChartType

    charts: ChartItem[]

    columns?: number

    contextMenu?: DropdownItem[]

    isDarkThemeFunction: (() => boolean) | undefined
}