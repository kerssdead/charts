import Point from '@/types/Point'
import Span from '@/types/Span'
import { LineDrawMode } from '@/static/Enums'
import { lerp } from '@/helpers/Geometry'
import { CurveSegment, getMonotoneSegments, splitCurveSegment } from '@/helpers/MonotoneCurve'

function traceCurveSegment(ctx: CanvasRenderingContext2D, { firstControl, secondControl, end }: CurveSegment) {
    ctx.bezierCurveTo(firstControl.x, firstControl.y, secondControl.x, secondControl.y, end.x, end.y)
}

function segmentLength(stops: Point[], index: number) {
    return Math.hypot(stops[index].x - stops[index - 1].x, stops[index].y - stops[index - 1].y)
}

export default class LinePathTracer {
    readonly partialStop: Point = { x: 0, y: 0 }

    private readonly isSmooth: boolean

    private curveSegments: CurveSegment[] = []

    private partialCurveSegment: CurveSegment | null = null

    private lengths: number[] = []

    private total = 0

    private lengthStops: Point[] | null = null

    private isMorphing = false

    constructor(drawMode: LineDrawMode = LineDrawMode.Straight) {
        this.isSmooth = drawMode === LineDrawMode.Smooth
    }

    updateCurve(stops: Point[], isMorphing = false) {
        this.isMorphing = isMorphing

        if (this.isSmooth)
            this.curveSegments = getMonotoneSegments(stops)
    }

    placeProgress(stops: Point[], progress: number) {
        const lengths = this.isMorphing || this.lengthStops !== stops
                        ? this.cacheLengths(stops)
                        : this.lengths

        let left = this.total * progress

        for (let i = 1; i < stops.length; i++) {
            const length = lengths[i]

            if (left >= length) {
                left -= length

                continue
            }

            this.placePartialStop(stops, i, length === 0 ? 0 : left / length)

            return i
        }

        return stops.length
    }

    private cacheLengths(stops: Point[]) {
        this.lengthStops = stops

        let total = 0

        this.lengths = stops.map((_, i) => {
            if (i === 0)
                return 0

            const length = segmentLength(stops, i)

            total += length

            return length
        })

        this.total = total

        return this.lengths
    }

    placePartialStop(stops: Point[], endIndex: number, segmentProgress: number) {
        const from = stops[endIndex - 1]
        const to = stops[endIndex]

        if (this.isSmooth) {
            this.partialCurveSegment = splitCurveSegment(from, this.curveSegments[endIndex - 1], segmentProgress)
            this.partialStop.x = this.partialCurveSegment.end.x
            this.partialStop.y = this.partialCurveSegment.end.y

            return
        }

        this.partialStop.x = lerp(from.x, to.x, segmentProgress)
        this.partialStop.y = lerp(from.y, to.y, segmentProgress)
    }

    trace(ctx: CanvasRenderingContext2D, stops: Point[], drawnStopCount: number, hasPartialStop: boolean) {
        const end = hasPartialStop ? drawnStopCount : drawnStopCount - 1

        this.traceSlice(ctx, stops, drawnStopCount, { start: 0, end })
    }

    traceSlice(ctx: CanvasRenderingContext2D, stops: Point[], drawnStopCount: number, { start, end }: Span) {
        const first = this.pointAt(stops, drawnStopCount, start)

        ctx.moveTo(first.x, first.y)

        for (let i = start + 1; i <= end; i++)
            this.traceSegmentTo(ctx, stops, drawnStopCount, i)
    }

    private pointAt(stops: Point[], drawnStopCount: number, index: number) {
        return index < drawnStopCount ? stops[index] : this.partialStop
    }

    private traceSegmentTo(ctx: CanvasRenderingContext2D, stops: Point[], drawnStopCount: number, index: number) {
        if (!this.isSmooth) {
            const point = this.pointAt(stops, drawnStopCount, index)

            ctx.lineTo(point.x, point.y)

            return
        }

        const segment = index < drawnStopCount ? this.curveSegments[index - 1] : this.partialCurveSegment

        if (segment)
            traceCurveSegment(ctx, segment)
    }
}