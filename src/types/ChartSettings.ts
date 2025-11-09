import Data from 'types/interfaces/Data'
import DropdownItem from 'types/DropdownItem'
import { ChartType, LegendPlace } from 'static/Enums'

class ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    disableInitAnimation: boolean

    disableInteractions: boolean

    width: number

    height: number

    minWidth: number | undefined

    minHeight: number | undefined

    baseColor: string

    title: string

    templateId: string

    valuePostfix: string | undefined

    type: ChartType

    legendPlace: LegendPlace

    data: Data

    contextMenu?: DropdownItem[]

    isDarkThemeFunction: Function | undefined
}

export default ChartSettings