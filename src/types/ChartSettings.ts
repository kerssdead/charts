class ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    disableInitAnimation: boolean

    width: number

    height: number

    minWidth: number | undefined

    minHeight: number | undefined

    legendHeight: number | 0

    baseColor: string

    title: string

    templateId: string

    type: ChartType

    legendPlace: LegendPlace

    data: Data

    contextMenu?: DropdownItem[]

    isDarkThemeFunction: Function | undefined
}