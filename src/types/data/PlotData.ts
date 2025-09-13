class PlotData implements Data {
    values: PlotSeries[]

    type: number

    xTitle: string

    yTitle: string

    yMax: number

    xType: PlotAxisType

    shortLabels: boolean

    static getRows(data: PlotData): TableData {
        let headers: TableHeaderValue[] = []

        let values: TableValue[] = []

        for (const series of data.values) {
            let seriesValues = new Map<string, any>()

            for (const value of series.values) {
                seriesValues.set(value.x.toString(), value.y)
                headers.push({
                    value: value.x.toString(),
                    display: data.xType == PlotAxisType.Date
                        ? new Date(value.x).toLocaleDateString()
                        : value.x.toString()
                })
            }

            values.push({
                name: series.label,
                values: seriesValues
            })
        }

        return {
            headers: [...new Set(headers)],
            values: values
        }
    }
}