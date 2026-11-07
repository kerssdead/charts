import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import { PlotScaleType, PlotType } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { getLogAxisValues } from '@/helpers/AxisTicks'
import { getStackKey } from '@/render/plot/PlotColumnGroups'
import { AXIS_VALUE_COUNT } from '@/render/plot/PlotConstants'

export function getAxisValues(
    series: PlotSeries[],
    yMax: number | undefined,
    hasOnlyBarSeries: boolean,
    yScale = PlotScaleType.Linear
) {
    const stacks = new Map<string, number>()
    const yValues: number[] = []
    const xValues: number[] = []

    for (const item of series) {
        for (const value of item.values) {
            const y = getY(value)

            if (y == null)
                continue

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

    const getValues = (values: number[], max: number | undefined) => {
        if (yScale == PlotScaleType.Log)
            return getLogAxisValues(values, max)

        return getRoundedValues(values, AXIS_VALUE_COUNT, max)
    }

    return {
        yAxisValues: getValues([...stacks.values(), ...yValues], yMax),
        xAxisValues: getValues(xValues, hasOnlyBarSeries ? yMax : undefined)
    }
}