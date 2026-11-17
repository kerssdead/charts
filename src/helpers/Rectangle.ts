import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import { clamp, lerp } from '@/helpers/Geometry'

export default abstract class Rectangle {
    static empty(): RectangleDimensions {
        return { x: 0, y: 0, width: 0, height: 0 }
    }

    static copy({ x, y, width, height }: RectangleDimensions): RectangleDimensions {
        return { x, y, width, height }
    }

    static same(a: RectangleDimensions, b: RectangleDimensions) {
        return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
    }

    static lerp(from: RectangleDimensions, to: RectangleDimensions, t: number): RectangleDimensions {
        return {
            x: lerp(from.x, to.x, t),
            y: lerp(from.y, to.y, t),
            width: lerp(from.width, to.width, t),
            height: lerp(from.height, to.height, t)
        }
    }

    static contains(rect: RectangleDimensions, point: Point | null) {
        return !!point
               && rect.x <= point.x && point.x <= rect.x + rect.width
               && rect.y <= point.y && point.y <= rect.y + rect.height
    }

    static containsRounded(rect: RectangleDimensions, cornerRadius: number, point: Point) {
        const { x, y, width, height } = rect
        const radius = Math.min(cornerRadius, width / 2, height / 2)

        const dx = point.x - clamp(point.x, x + radius, x + width - radius)
        const dy = point.y - clamp(point.y, y + radius, y + height - radius)

        return dx * dx + dy * dy <= radius * radius
    }
}