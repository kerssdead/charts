import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import { PlotType } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import { getStackKey } from '@/render/plot/PlotColumnGroups'
import { CORNER_RADIUS } from '@/render/plot/PlotConstants'

export type StackOutline = {
    far: number
    needsClip: boolean
}

type StackState = {
    total: number
    segments: number
    topStart: number
}

export function getStackOutlines(layout: PlotLayout, series: PlotSeries[]) {
    const { baseline, valueScale } = layout.vertical
    const coordinate = (value: number) => {
        return value === 0 ? baseline : valueScale.getCoordinate(layout.capToYMax(value))
    }
    const radius = layout.units.toPxX(CORNER_RADIUS)
    const outlines = new Map<string, StackOutline>()

    for (const [key, { total, segments, topStart }] of getStackStates(layout, series)) {
        const far = coordinate(total)
        const topHeight = layout.units.toPxY(Math.abs(far - coordinate(topStart)))

        outlines.set(key, { far, needsClip: segments > 1 && topHeight < radius })
    }

    return outlines
}

function getStackStates(layout: PlotLayout, series: PlotSeries[]) {
    const states = new Map<string, StackState>()

    for (const item of series.filter(stacked => stacked.type === PlotType.StackingColumn)) {
        for (const value of item.values) {
            const y = getY(value)

            if (y == null || !layout.vertical.valueScale.canShow(y))
                continue

            const key = getStackKey(value)
            const state = states.get(key) ?? { total: 0, segments: 0, topStart: 0 }

            if (y !== 0)
                addSegment(layout, state)

            state.total += y

            states.set(key, state)
        }
    }

    return states
}

function addSegment(layout: PlotLayout, state: StackState) {
    state.segments++

    if (layout.yMax === undefined || state.total < layout.yMax)
        state.topStart = state.total
}
