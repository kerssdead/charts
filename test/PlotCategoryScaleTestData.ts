import PlotSeries from '@/types/PlotSeries'
import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { getSlots } from '@/render/plot/PlotSlots'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'

export const EVEN_SLOTS = getSlots(
    [{ values: Array.from({ length: 4 }, (_, i) => ({ x: i, y: 1 })) } as PlotSeries],
    PlotAxisType.Number
)

export const CONTINUOUS_SLOTS = getSlots(
    [{ values: [0, 10, 40].map(x => ({ x, y: 1 })) } as PlotSeries],
    PlotAxisType.Number
)

export const CONTINUOUS_AXIS = PlotContinuousAxis.create(
    CONTINUOUS_SLOTS,
    PlotAxisType.Number,
    PlotScaleType.Linear
)