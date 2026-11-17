import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import Size from '@/types/Size'

export default abstract class PointHelper {
    static same(a: Point | null | undefined, b: Point | null | undefined) {
        return a?.x === b?.x && a?.y === b?.y
    }

    static placeNear(point: Point, size: Size, offset: number, bounds: RectangleDimensions): Point {
        const { width, height } = size
        let x = point.x + offset
        let y = point.y + offset

        if (x + width > bounds.x + bounds.width)
            x = point.x - offset - width

        if (y + height > bounds.y + bounds.height)
            y = point.y - offset - height

        return { x: Math.max(x, bounds.x), y: Math.max(y, bounds.y) }
    }

    static findClosestStop(
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
}