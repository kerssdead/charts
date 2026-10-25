import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { getStackKey } from '@/render/plot/PlotColumnGroups'
import { AXIS_VALUE_COUNT } from '@/render/plot/PlotConstants'

export function getAxisValues(series: PlotSeries[], yMax: number | undefined, isHorizontal: boolean) {
    const stacks = new Map<string, number>()
    const yValues: number[] = []
    const xValues: number[] = []

    for (const item of series) {
        for (const value of item.values) {
            const y = Number(value.y)

            if (item.type == PlotType.Bar) {
                xValues.push(y)
            } else if (item.type == PlotType.StackingColumn) {
                const key = getStackKey(value)

                stacks.set(key, (stacks.get(key) ?? 0) + y)
            } else {
                yValues.push(y)
            }
        }
    }

    return {
        yAxisValues: getRoundedValues([...stacks.values(), ...yValues], AXIS_VALUE_COUNT, yMax),
        xAxisValues: getRoundedValues(xValues, AXIS_VALUE_COUNT, isHorizontal ? yMax : undefined)
    }
}