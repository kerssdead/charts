import Point from '@/types/Point'
import { lerp } from '@/helpers/Geometry'

export type CurveSegment = {
    firstControl: Point
    secondControl: Point
    end: Point
}

function getSecantSlopes(stops: Point[]) {
    const slopes: number[] = []

    for (let i = 1; i < stops.length; i++) {
        const width = stops[i].x - stops[i - 1].x

        slopes.push(width == 0 ? 0 : (stops[i].y - stops[i - 1].y) / width)
    }

    return slopes
}

function getInnerTangent(stops: Point[], slopes: number[], index: number) {
    const slopeBefore = slopes[index - 1]
    const slopeAfter = slopes[index]

    if (!(slopeBefore * slopeAfter > 0))
        return 0

    const widthBefore = stops[index].x - stops[index - 1].x
    const widthAfter = stops[index + 1].x - stops[index].x
    const weightBefore = 2 * widthAfter + widthBefore
    const weightAfter = widthAfter + 2 * widthBefore

    return (weightBefore + weightAfter) / (weightBefore / slopeBefore + weightAfter / slopeAfter)
}

function getTangents(stops: Point[]) {
    const slopes = getSecantSlopes(stops)
    const last = stops.length - 1

    if (last == 1)
        return [slopes[0], slopes[0]]

    const tangents = stops.map((_, i) => i == 0 || i == last ? 0 : getInnerTangent(stops, slopes, i))

    tangents[0] = (3 * slopes[0] - tangents[1]) / 2
    tangents[last] = (3 * slopes[last - 1] - tangents[last - 1]) / 2

    return tangents
}

export function getMonotoneSegments(stops: Point[]): CurveSegment[] {
    if (stops.length < 2)
        return []

    const tangents = getTangents(stops)

    return stops.slice(1).map((end, i) => {
        const start = stops[i]
        const controlOffset = (end.x - start.x) / 3

        return {
            firstControl: { x: start.x + controlOffset, y: start.y + tangents[i] * controlOffset },
            secondControl: { x: end.x - controlOffset, y: end.y - tangents[i + 1] * controlOffset },
            end
        }
    })
}

function lerpPoint(from: Point, to: Point, t: number): Point {
    return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) }
}

export function splitCurveSegment(
    start: Point,
    { firstControl, secondControl, end }: CurveSegment,
    fraction: number
): CurveSegment {
    const startToFirst = lerpPoint(start, firstControl, fraction)
    const firstToSecond = lerpPoint(firstControl, secondControl, fraction)
    const secondToEnd = lerpPoint(secondControl, end, fraction)
    const nearStart = lerpPoint(startToFirst, firstToSecond, fraction)
    const nearEnd = lerpPoint(firstToSecond, secondToEnd, fraction)

    return {
        firstControl: startToFirst,
        secondControl: nearStart,
        end: lerpPoint(nearStart, nearEnd, fraction)
    }
}