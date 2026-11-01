import LinePathTracer from '@/render/LinePathTracer'
import { LineDrawMode } from '@/static/Enums'
import Point from '@/types/Point'

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 }]

const context = () => ({
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn()
})

const trace = (
    tracer: LinePathTracer,
    stops: Point[],
    drawnStopCount: number,
    hasPartialStop: boolean = false
) => {
    const ctx = context()

    tracer.trace(ctx as unknown as CanvasRenderingContext2D, stops, drawnStopCount, hasPartialStop)

    return ctx
}

const smoothTracer = (stops: Point[]) => {
    const tracer = new LinePathTracer(LineDrawMode.Smooth)

    tracer.updateCurve(stops)

    return tracer
}

const curveEnds = (ctx: ReturnType<typeof context>) => {
    return ctx.bezierCurveTo.mock.calls.map(call => ({ x: call[4], y: call[5] }))
}

describe('Tracing line path', () => {
    it('Should start at first stop', () => {
        expect(trace(smoothTracer(STOPS), STOPS, 4).moveTo)
            .toHaveBeenCalledWith(0, 0)
    })

    it('Should trace straight segments by default', () => {
        const ctx = trace(new LinePathTracer(), STOPS, 4)

        expect([ctx.lineTo.mock.calls, ctx.bezierCurveTo.mock.calls.length])
            .toEqual([[[10, 30], [20, 10], [30, 40]], 0])
    })

    it('Should trace straight segments up to the drawn stop', () => {
        expect(trace(new LinePathTracer(LineDrawMode.Straight), STOPS, 2).lineTo.mock.calls)
            .toEqual([[10, 30]])
    })

    it('Should end straight path at partial stop', () => {
        const tracer = new LinePathTracer()

        tracer.placePartialStop(STOPS, 2, 0.5)

        expect(trace(tracer, STOPS, 2, true).lineTo.mock.calls)
            .toEqual([[10, 30], [15, 20]])
    })

    it('Should trace curves through every stop in smooth mode', () => {
        const ctx = trace(smoothTracer(STOPS), STOPS, 4)

        expect([curveEnds(ctx), ctx.lineTo.mock.calls.length])
            .toEqual([STOPS.slice(1), 0])
    })

    it('Should trace curves up to the drawn stop', () => {
        expect(curveEnds(trace(smoothTracer(STOPS), STOPS, 2)))
            .toEqual([STOPS[1]])
    })

    it('Should end smooth path at partial stop', () => {
        const tracer = smoothTracer(STOPS)

        tracer.placePartialStop(STOPS, 2, 0.5)

        expect(curveEnds(trace(tracer, STOPS, 2, true)))
            .toEqual([STOPS[1], tracer.partialStop])
    })

    it('Should use the latest stops after curve update', () => {
        const tracer = smoothTracer(STOPS)
        const moved = STOPS.map(stop => ({ x: stop.x, y: stop.y + 100 }))

        tracer.updateCurve(moved)

        expect(curveEnds(trace(tracer, moved, 4)))
            .toEqual(moved.slice(1))
    })

    it('Should trace nothing after a single smooth stop', () => {
        const stops = [{ x: 5, y: 5 }]
        const ctx = trace(smoothTracer(stops), stops, 1)

        expect([ctx.moveTo.mock.calls, ctx.bezierCurveTo.mock.calls.length])
            .toEqual([[[5, 5]], 0])
    })
})