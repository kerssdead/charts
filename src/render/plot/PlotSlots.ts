import PlotSeries from '@/types/PlotSeries'
import PlotPoint from '@/types/PlotPoint'
import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'
import { MAX_SLOT_GAP, SLOT_GAP_RATIO } from '@/render/plot/PlotConstants'

export type Slots = {
    values: PlotPoint['x'][]
    index: Map<string, number>
}

export function getSlots(series: PlotSeries[], xType: PlotAxisType): Slots {
    const unique = new Map<string, PlotPoint['x']>()

    for (const item of series)
        for (const value of item.values)
            if (!unique.has(value.x.toString()))
                unique.set(value.x.toString(), value.x)

    const values = Array.from(unique.values())

    const order = (x: PlotPoint['x']) => xType == PlotAxisType.Date ? Formatter.toDate(x).getTime() : Number(x)

    if (xType != PlotAxisType.Text && values.every(x => !isNaN(order(x))))
        values.sort((a, b) => order(a) - order(b))

    return { values, index: new Map(values.map((x, i) => [x.toString(), i])) }
}

export function getGap(available: number, count: number) {
    return Math.min(MAX_SLOT_GAP, available / Math.max(count, 1) * SLOT_GAP_RATIO)
}