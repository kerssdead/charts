import { clamp } from '@/helpers/Geometry'
import {
    AXIS_LABEL_HEIGHT,
    DEFAULT_RESOLUTION,
    LABEL_GAP,
    MAX_RESOLUTION,
    PADDING,
    SCALE_HEIGHT,
    TITLE_FONT
} from '@/render/heatMap/HeatMapConstants'
import { stringWidth } from '@/helpers/Text'
import { maxOf } from '@/helpers/Collections'
import { HeatMapResolution } from '@/types/data/HeatMapData'
import RectangleDimensions from '@/types/RectangleDimensions'
import Paddings from '@/types/Paddings'
import Units from '@/helpers/Units'

export type Extent = {
    width: number
    height: number
}

export function getEdges(count: number, start: number, size: number) {
    return Array.from({ length: count + 1 }, (_, index) => start + Math.round(size * index / count))
}

export function getColorRatio(value: number, min: number, max: number) {
    return max > min ? (value - min) / (max - min) : 1
}

type AxesSizing = {
    yLabels: string[]
    xTitle?: string
    yTitle?: string
    font: number
}

export function getMargins(axes: AxesSizing | null) {
    const margins: Paddings = {
        left: PADDING,
        top: PADDING,
        right: PADDING,
        bottom: PADDING + SCALE_HEIGHT + LABEL_GAP
    }

    if (!axes)
        return margins

    margins.left += Math.ceil(maxOf(axes.yLabels, label => stringWidth(label, axes.font))) + LABEL_GAP

    if (axes.yTitle)
        margins.left += TITLE_FONT + LABEL_GAP

    margins.bottom += Math.ceil(AXIS_LABEL_HEIGHT) + LABEL_GAP

    if (axes.xTitle)
        margins.bottom += TITLE_FONT + LABEL_GAP

    return margins
}

export function getBounds(width: number, height: number, margins: Paddings): RectangleDimensions {
    return {
        x: margins.left,
        y: margins.top,
        width: Math.max(1, width - margins.left - margins.right),
        height: Math.max(1, height - margins.top - margins.bottom)
    }
}

export function getArea(bounds: RectangleDimensions, extent: Extent | null): RectangleDimensions {
    if (!extent)
        return bounds

    const scale = Math.min(bounds.width / extent.width, bounds.height / extent.height)
    const width = Math.round(extent.width * scale)
    const height = Math.round(extent.height * scale)

    return {
        x: bounds.x + Math.round((bounds.width - width) / 2),
        y: bounds.y + Math.round((bounds.height - height) / 2),
        width,
        height
    }
}

export function getResolution(resolution: HeatMapResolution, extent: Extent) {
    const toCount = (value: number) => {
        return Number.isNaN(value) ? DEFAULT_RESOLUTION : clamp(Math.round(value), 1, MAX_RESOLUTION)
    }

    if (typeof resolution == 'object')
        return { columns: toCount(resolution.columns), rows: toCount(resolution.rows) }

    const columns = toCount(resolution)

    return { columns, rows: toCount(columns * extent.height / extent.width) }
}

export function toUnits(units: Units, box: RectangleDimensions): RectangleDimensions {
    return { x: units.x(box.x), y: units.y(box.y), width: units.x(box.width), height: units.y(box.height) }
}