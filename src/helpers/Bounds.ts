import { Bounds } from '@/types/interfaces/RenderItemBase'
import RectangleDimensions from '@/types/RectangleDimensions'
import { DEFAULT_LINE_WIDTH } from '@/static/constants/Index'

export function boundsOverlap(bounds: Bounds, area: RectangleDimensions) {
    const margin = DEFAULT_LINE_WIDTH

    return bounds.right >= area.x - margin && bounds.left <= area.x + area.width + margin
           && bounds.bottom >= area.y - margin && bounds.top <= area.y + area.height + margin
}

export function boundsInside(bounds: Bounds, area: RectangleDimensions) {
    const margin = DEFAULT_LINE_WIDTH

    return bounds.left >= area.x + margin && bounds.right <= area.x + area.width - margin
           && bounds.top >= area.y + margin && bounds.bottom <= area.y + area.height - margin
}