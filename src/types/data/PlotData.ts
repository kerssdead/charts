import { TableValue } from '../TableValue'
import { PlotSeries } from '../PlotSeries'
import { TableHeaderValue } from '../TableHeaderValue'
import { TableData } from '../TableData'
import { Data } from '../interfaces/Data'
import { Formatter } from '../../helpers/Formatter'
import { PlotAxisType } from '../../static/Enums'

export class PlotData implements Data {
    shortLabels: boolean

    simple: boolean

    yMax: number

    xTitle: string

    yTitle: string

    xType: PlotAxisType

    values: PlotSeries[]

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
                             ? Formatter.date(new Date(value.x))
                             : value.x.toString()
                })
            }

            values.push({
                name: series.label,
                values: seriesValues
            })
        }

        const unique = new Set(),
            uniqueHeaders = headers.filter(v => !unique.has(v.display) && unique.add(v.display))

        if (data.xType == PlotAxisType.Date)
            uniqueHeaders.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime())

        return {
            headers: uniqueHeaders,
            values: values
        }
    }
}