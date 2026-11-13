import Data from '@/types/interfaces/Data'
import DropdownItem from '@/types/DropdownItem'
import { ChartType, ImageCrossOrigin, LegendPlace } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'

export default interface ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    enableMove: boolean

    staticMode: boolean

    disableInteractions: boolean

    disableMenu: boolean

    enableDebugMode: boolean

    baseColor: string

    title: string

    templateId: string

    valuePostfix: string | undefined

    decimals?: number

    legendPlace: LegendPlace

    data: Data

    type: ChartType

    charts: ChartItem[]

    columns?: number

    numberLocale?: string

    width?: string

    height?: string

    contextMenu?: DropdownItem[]

    imageCrossOrigin?: ImageCrossOrigin

    isDarkThemeFunction: (() => boolean) | undefined

    onError?: (error: unknown) => boolean | void
}