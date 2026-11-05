import Formatter from '@/helpers/Formatter'
import { getLinearTicks, getLogTicksBetween } from '@/helpers/AxisTicks'
import { getDateTicks } from '@/helpers/DateTicks'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'
import { Slots } from '@/render/plot/PlotSlots'
import { toScaleUnits } from '@/render/plot/PlotScaleUnits'
import { CONTINUOUS_TICK_COUNT } from '@/render/plot/PlotConstants'

export default class PlotContinuousAxis {
    readonly slotValues: number[]

    readonly ticks: number[]

    readonly minSlotDistance: number

    private readonly isLog: boolean

    private readonly min: number

    private readonly max: number

    private constructor(slotValues: number[], ticks: number[], isLog: boolean) {
        this.slotValues = slotValues
        this.ticks = ticks
        this.isLog = isLog
        this.min = toScaleUnits(slotValues[0], isLog)
        this.max = toScaleUnits(slotValues[slotValues.length - 1], isLog)
        this.minSlotDistance = slotValues.slice(1).reduce(
            (min, value, i) => Math.min(min, this.getRatio(value) - this.getRatio(slotValues[i])),
            1
        )
    }

    static create(slots: Slots, xType: PlotAxisType, xScale: PlotScaleType) {
        if (xScale == PlotScaleType.Category || xType == PlotAxisType.Text)
            return null

        const isDate = xType == PlotAxisType.Date
        const isLog = xScale == PlotScaleType.Log && !isDate
        const values = slots.values.map(x => isDate ? Formatter.toDate(x).getTime() : Number(x))

        if (values.some(value => !Number.isFinite(value) || isLog && value <= 0))
            return null

        const min = values[0]
        const max = values[values.length - 1]

        if (values.length < 2 || min == max)
            return null

        return new PlotContinuousAxis(values, PlotContinuousAxis.getTicks(min, max, isLog, isDate), isLog)
    }

    private static getTicks(min: number, max: number, isLog: boolean, isDate: boolean) {
        if (isLog)
            return getLogTicksBetween(min, max)

        return isDate ? getDateTicks(min, max, CONTINUOUS_TICK_COUNT) : getLinearTicks(min, max, CONTINUOUS_TICK_COUNT)
    }

    getRatio(value: number) {
        return (toScaleUnits(value, this.isLog) - this.min) / (this.max - this.min)
    }
}