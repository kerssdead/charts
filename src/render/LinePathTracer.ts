import Point from '@/types/Point'
import { LineDrawMode } from '@/static/Enums'
import { lerp } from '@/helpers/Geometry'
import { CurveSegment, getMonotoneSegments, splitCurveSegment } from '@/helpers/MonotoneCurve'

function traceCurveSegment(ctx: CanvasRenderingContext2D, { firstControl, secondControl, end }: CurveSegment) {
    ctx.bezierCurveTo(firstControl.x, firstControl.y, secondControl.x, secondControl.y, end.x, end.y)
}

export default class LinePathTracer {
    readonly partialStop: Point = { x: 0, y: 0 }

    private readonly isSmooth: boolean

    private curveSegments: CurveSegment[] = []

    private partialCurveSegment: CurveSegment | null = null

    constructor(drawMode: LineDrawMode = LineDrawMode.Straight) {
        this.isSmooth = drawMode == LineDrawMode.Smooth
    }

    updateCurve(stops: Point[]) {
        if (this.isSmooth)
            this.curveSegments = getMonotoneSegments(stops)
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
        ctx.moveTo(stops[0].x, stops[0].y)

        if (this.isSmooth)
            this.traceCurve(ctx, drawnStopCount, hasPartialStop)
        else
            this.traceStraight(ctx, stops, drawnStopCount, hasPartialStop)
    }

    private traceStraight(
        ctx: CanvasRenderingContext2D,
        stops: Point[],
        drawnStopCount: number,
        hasPartialStop: boolean
    ) {
        for (let i = 1; i < drawnStopCount; i++)
            ctx.lineTo(stops[i].x, stops[i].y)

        if (hasPartialStop)
            ctx.lineTo(this.partialStop.x, this.partialStop.y)
    }

    private traceCurve(ctx: CanvasRenderingContext2D, drawnStopCount: number, hasPartialStop: boolean) {
        for (let i = 1; i < drawnStopCount; i++)
            traceCurveSegment(ctx, this.curveSegments[i - 1])

        if (hasPartialStop)
            traceCurveSegment(ctx, this.partialCurveSegment!)
    }
}