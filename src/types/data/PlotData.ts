import PlotSeries from '@/types/PlotSeries'
import TableHeaderValue from '@/types/TableHeaderValue'
import TableData from '@/types/TableData'
import Data from '@/types/interfaces/Data'
import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'

export default interface PlotData extends Data {
    shortLabels: boolean

    simple: boolean

    yMax: number | undefined

    xTitle: string

    yTitle: string

    xType: PlotAxisType

    values: PlotSeries[]
}

export function getPlotRows(data: PlotData): TableData {
    const headers = new Map<string, TableHeaderValue>()

    const values = data.values.map(series => {
        const seriesValues = new Map<string, number>()

        for (const value of series.values) {
            const key = value.x.toString()

            seriesValues.set(key, Number(value.y))

            if (!headers.has(key))
                headers.set(key, { value: key, display: Formatter.axis(value.x, data.xType) })
        }

        return { name: series.label, values: seriesValues }
    })

    const uniqueHeaders = [...headers.values()]

    const order = (x: string) => data.xType == PlotAxisType.Date ? Formatter.toDate(x).getTime() : Number(x)

    if (data.xType != PlotAxisType.Text && uniqueHeaders.every(header => !isNaN(order(header.value))))
        uniqueHeaders.sort((a, b) => order(a.value) - order(b.value))

    return { headers: uniqueHeaders, values }
}