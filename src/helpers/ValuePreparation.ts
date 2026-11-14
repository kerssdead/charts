import { PlotType } from '@/static/Enums'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import TreeBarRow from '@/types/TreeBarRow'
import TreeBarData from '@/types/data/TreeBarData'
import PlotData from '@/types/data/PlotData'
import Data from '@/types/interfaces/Data'

function createValuePreparer() {
    const counts = new Map<string, number>()

    return <T extends Value>(value: T, hasDefaultLabel: boolean = true) => {
        if (hasDefaultLabel)
            value.label ||= TextResources.noLabel

        const label = value.label ?? ''
        const count = counts.get(label) ?? 0

        counts.set(label, count + 1)

        value.labelIndex = count
        value.id ??= `${ label }-${ count }`

        return value
    }
}

export function prepareSectors(data: Data) {
    const prepare = createValuePreparer()

    data.values = data.values.map(value => prepare(value instanceof Value ? value : new Sector(value)))
}

export function prepareSeries(data: PlotData) {
    const prepare = createValuePreparer()

    data.values = data.values.map(value => {
        const series = value instanceof Value ? value : new PlotSeries(value)

        series.type ??= PlotType.Line

        return prepare(series)
    })
}

export function prepareSegmentedBar(data: SegmentedBarData, numberLocale: string | undefined) {
    const prepare = createValuePreparer()

    const toStop = (stop: SegmentedBarStop) => {
        return stop instanceof Value ? stop : new SegmentedBarStop(stop, numberLocale)
    }

    data.values = data.values.map(value => prepare(value instanceof Value ? value : new Sector(value), false))
    data.stops = (data.stops ?? []).map(stop => prepare(toStop(stop), false))
}

export function prepareTreeBarRows(data: TreeBarData, numberLocale: string | undefined) {
    const prepare = createValuePreparer()

    const prepareRow = (value: TreeBarRow): TreeBarRow => {
        const row = prepare(value instanceof TreeBarRow ? value : new TreeBarRow(value))

        row.parts = (row.parts ?? []).map(part => {
            return prepare(part instanceof Value ? part : new Sector(part), false)
        })
        row.children = row.children?.map(prepareRow)

        return row
    }

    data.values = data.values.map(prepareRow)
    data.numberLocale = numberLocale
}