import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import Size from '@/types/Size'

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

export function getInnerRadiusRatio(innerRadiusPercent: number, defaultPercent: number) {
    return clamp(Number.isFinite(innerRadiusPercent) ? innerRadiusPercent : defaultPercent, 0, 100) / 100
}

export function lerp(from: number, to: number, t: number) {
    return from + (to - from) * t
}

export function lerpRect(from: RectangleDimensions, to: RectangleDimensions, t: number): RectangleDimensions {
    return {
        x: lerp(from.x, to.x, t),
        y: lerp(from.y, to.y, t),
        width: lerp(from.width, to.width, t),
        height: lerp(from.height, to.height, t)
    }
}

export function samePoint(a: Point | null | undefined, b: Point | null | undefined) {
    return a?.x === b?.x && a?.y === b?.y
}

export function sameRect(a: RectangleDimensions, b: RectangleDimensions) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

export function copyRect({ x, y, width, height }: RectangleDimensions): RectangleDimensions {
    return { x, y, width, height }
}

export function contains(rect: RectangleDimensions, point: Point | null) {
    return !!point
           && rect.x <= point.x && point.x <= rect.x + rect.width
           && rect.y <= point.y && point.y <= rect.y + rect.height
}

export function containsRounded(rect: RectangleDimensions, cornerRadius: number, point: Point) {
    const { x, y, width, height } = rect
    const radius = Math.min(cornerRadius, width / 2, height / 2)

    const dx = point.x - clamp(point.x, x + radius, x + width - radius)
    const dy = point.y - clamp(point.y, y + radius, y + height - radius)

    return dx * dx + dy * dy <= radius * radius
}

export function placeNear(point: Point, size: Size, offset: number, bounds: RectangleDimensions): Point {
    const { width, height } = size
    let x = point.x + offset
    let y = point.y + offset

    if (x + width > bounds.x + bounds.width)
        x = point.x - offset - width

    if (y + height > bounds.y + bounds.height)
        y = point.y - offset - height

    return { x: Math.max(x, bounds.x), y: Math.max(y, bounds.y) }
}

export function toRadians(degrees: number) {
    return degrees * Math.PI / 180
}

export function normalizeAngle(angle: number) {
    return Math.atan2(Math.sin(angle), Math.cos(angle))
}

export function boxEdgeDistance(angle: number, halfWidth: number, halfHeight: number, distance: number) {
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))

    if (sin > 1e-6) {
        const horizontalEdgeCenter = (distance + halfHeight) / sin

        if (horizontalEdgeCenter * cos <= halfWidth)
            return horizontalEdgeCenter - distance
    }

    if (cos > 1e-6) {
        const verticalEdgeCenter = (distance + halfWidth) / cos

        if (verticalEdgeCenter * sin <= halfHeight)
            return verticalEdgeCenter - distance
    }

    const cornerProjection = cos * halfWidth + sin * halfHeight

    const discriminant = cornerProjection * cornerProjection
        - halfWidth * halfWidth
        - halfHeight * halfHeight
        + distance * distance

    return cornerProjection + Math.sqrt(Math.max(discriminant, 0)) - distance
}

export function findClosestStop(
    stops: Point[],
    point: Point,
    maxDistance: number,
    { isSortedX, isInside }: { isSortedX: boolean, isInside: (stop: Point) => boolean }
) {
    if (stops.length === 0)
        return -1

    let start = 0

    if (isSortedX) {
        let low = 0
        let high = stops.length

        while (low < high) {
            const mid = (low + high) >> 1

            if (stops[mid].x < point.x - maxDistance)
                low = mid + 1
            else
                high = mid
        }

        start = low
    }

    let closest = -1
    let distance = maxDistance

    for (let i = start; i < stops.length; i++) {
        const stop = stops[i]

        if (isSortedX && stop.x > point.x + maxDistance)
            break

        if (!isInside(stop))
            continue

        const current = Math.hypot(point.x - stop.x, point.y - stop.y)

        if (current <= distance) {
            closest = i
            distance = current
        }
    }

    return closest
}
