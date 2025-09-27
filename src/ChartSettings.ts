class ChartSettings {
    enableLegend: boolean

    enableTooltip: boolean

    enableOther: boolean

    width: number

    height: number

    maxWidth: number | undefined

    maxHeight: number | undefined

    baseColor: string

    title: string

    templateId: string

    type: ChartType

    legendPlace: LegendPlace

    data: Data

    contextMenu?: DropdownItem[]

    isDarkThemeFunction: Function | undefined
}