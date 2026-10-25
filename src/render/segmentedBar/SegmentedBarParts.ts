import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import RectangleDimensions from '@/types/RectangleDimensions'
import { clamp } from '@/helpers/Geometry'
import { sum } from '@/helpers/Collections'
import { PERCENT_SCALE } from '@/render/segmentedBar/SegmentedBarConstants'

export type Part = {
    sector: Sector
    box: RectangleDimensions
}

export type PartsLayout = {
    parts: Part[]
    widthPerValue: number
}

export function getFullBarValue(values: Sector[], stops: SegmentedBarStop[], isPercentageMode: boolean) {
    if (isPercentageMode)
        return PERCENT_SCALE

    const largestStopValue = Math.max(...stops.filter(stop => !stop.isPercent).map(stop => stop.value), 0)

    return sum(values, value => value.value) || largestStopValue || 1
}

export function getParts(
    values: Sector[],
    bar: RectangleDimensions,
    fullBarValue: number,
    minPartWidth: number
): PartsLayout {
    const valuesBelowMinWidth = values.filter(value => value.value / fullBarValue * bar.width < minPartWidth)
    const canFitMinWidths = valuesBelowMinWidth.length * minPartWidth < bar.width
    const minWidthValues = canFitMinWidths ? valuesBelowMinWidth : []

    const widthPerValue = (bar.width - minWidthValues.length * minPartWidth)
                          / (fullBarValue - sum(minWidthValues, value => value.value))

    let x = bar.x

    const parts = values.map(sector => {
        // todo: minWidthValues.includes() makes this O(n·m); measure before switching to a Set
        const width = minWidthValues.includes(sector) ? minPartWidth : sector.value * widthPerValue
        const box = { x, y: bar.y, width, height: bar.height }

        x += width

        return { sector, box }
    })

    return { parts, widthPerValue }
}

export function getStopX(stop: SegmentedBarStop, { parts, widthPerValue }: PartsLayout, bar: RectangleDimensions) {
    if (stop.isPercent)
        return bar.x + bar.width * clamp(stop.value / PERCENT_SCALE, 0, 1)

    let remainingValue = Math.max(stop.value, 0)

    for (const { sector, box } of parts) {
        if (remainingValue <= sector.value)
            return box.x + box.width * remainingValue / sector.value

        remainingValue -= sector.value
    }

    const lastPart = parts[parts.length - 1]

    return (lastPart ? lastPart.box.x + lastPart.box.width : bar.x) + remainingValue * widthPerValue
}