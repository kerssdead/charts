import Data from '@/types/interfaces/Data'
import DropdownItem from '@/types/DropdownItem'
import { ChartType, ImageCrossOrigin, LegendPlace } from '@/static/Enums'
import { TextOverrides } from '@/static/TextResources'
import ChartItem from '@/types/ChartItem'
import EnumInput from '@/types/EnumInput'

export interface CommonOptions {
    enableLegend?: boolean

    enableTooltip?: boolean

    enableOther?: boolean

    enableMove?: boolean

    staticMode?: boolean

    disableInteractions?: boolean

    disableMenu?: boolean

    enableDebugMode?: boolean

    baseColor?: string

    title?: string

    templateId?: string

    valuePostfix?: string

    decimals?: number

    legendPlace?: EnumInput<LegendPlace>

    fontFamily?: string

    locale?: string

    strings?: TextOverrides

    numberLocale?: string

    width?: string

    height?: string

    contextMenu?: DropdownItem[]

    imageCrossOrigin?: ImageCrossOrigin

    isDarkThemeFunction?: () => boolean

    onError?: (error: unknown) => boolean | void
}

export type ChartItemOptions = Omit<ChartItem, 'type'> & { type?: EnumInput<ChartType> }

export type SingleChart = {
    type?: EnumInput<ChartType>

    data: Data

    charts?: never

    columns?: never
}

export type MultipleCharts = {
    charts: ChartItemOptions[]

    columns?: number

    type?: never

    data?: never
}

type ChartOptions = (SingleChart | MultipleCharts) & CommonOptions

export default ChartOptions