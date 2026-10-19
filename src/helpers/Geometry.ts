import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

export function lerp(from: number, to: number, t: number) {
    return from + (to - from) * t
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

export function placeNear(point: Point,
                          width: number,
                          height: number,
                          offset: number,
                          bounds: RectangleDimensions): Point {
    let x = point.x + offset
    let y = point.y + offset

    if (x + width > bounds.x + bounds.width)
        x = point.x - offset - width

    if (y + height > bounds.y + bounds.height)
        y = point.y - offset - height

    return { x: Math.max(x, bounds.x), y: Math.max(y, bounds.y) }
}

export function boxEdgeDistance(angle: number, halfWidth: number, halfHeight: number, distance: number) {
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))

    if (sin > 1e-6 && (distance + halfHeight) / sin * cos <= halfWidth)
        return (distance + halfHeight) / sin - distance

    if (cos > 1e-6 && (distance + halfWidth) / cos * sin <= halfHeight)
        return (distance + halfWidth) / cos - distance

    const b = cos * halfWidth + sin * halfHeight

    return b + Math.sqrt(Math.max(b * b - halfWidth * halfWidth - halfHeight * halfHeight + distance * distance, 0)) - distance
}