import PlotSeries from '@/types/PlotSeries'
import TableHeaderValue from '@/types/TableHeaderValue'
import TableData from '@/types/TableData'
import Data from '@/types/interfaces/Data'
import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'

export default class PlotData implements Data {
    shortLabels: boolean

    simple: boolean

    yMax: number | undefined

    xTitle: string

    yTitle: string

    xType: PlotAxisType

    values: PlotSeries[]

    static getRows(data: PlotData): TableData {
        const headers = new Map<string, TableHeaderValue>()

        const values = data.values.map(series => {
            const seriesValues = new Map<string, any>()

            for (const value of series.values) {
                const key = value.x.toString()

                seriesValues.set(key, value.y)

                if (!headers.has(key))
                    headers.set(key, { value: key, display: Formatter.axis(value.x, data.xType) })
            }

            return { name: series.label, values: seriesValues }
        })

        const uniqueHeaders = [...headers.values()]

        if (data.xType == PlotAxisType.Date)
            uniqueHeaders.sort((a, b) => Formatter.toDate(a.value).getTime() - Formatter.toDate(b.value).getTime())

        return { headers: uniqueHeaders, values }
    }
}