import LinePathTracer from '@/helpers/LinePathTracer'
import { LineDrawMode } from '@/static/Enums'
import Point from '@/types/Point'

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 }]

const context = () => ({
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn()
})

const traceSlice = (tracer: LinePathTracer, drawnStopCount: number, start: number, end: number) => {
    const ctx = context()

    tracer.traceSlice(ctx as unknown as CanvasRenderingContext2D, STOPS, drawnStopCount, { start, end })

    return ctx
}

const smoothTracer = (stops: Point[]) => {
    const tracer = new LinePathTracer(LineDrawMode.Smooth)

    tracer.updateCurve(stops)

    return tracer
}

describe('Tracing line path slice', () => {
    it('Should start at the slice start stop', () => {
        expect(traceSlice(new LinePathTracer(), 4, 1, 3).moveTo)
            .toHaveBeenCalledWith(10, 30)
    })

    it('Should draw straight segments up to the slice end stop', () => {
        expect(traceSlice(new LinePathTracer(), 4, 1, 3).lineTo.mock.calls)
            .toEqual([[20, 10], [30, 40]])
    })

    it('Should end at the partial stop past the drawn stops', () => {
        const tracer = new LinePathTracer()

        tracer.placePartialStop(STOPS, 2, 0.5)

        expect(traceSlice(tracer, 2, 0, 2).lineTo.mock.calls)
            .toEqual([[10, 30], [15, 20]])
    })

    it('Should draw only the curve segments of the slice', () => {
        const ctx = traceSlice(smoothTracer(STOPS), 4, 2, 3)

        expect(ctx.bezierCurveTo.mock.calls.map(call => ({ x: call[4], y: call[5] })))
            .toEqual([STOPS[3]])
    })

    it('Should end smooth slice at the partial stop', () => {
        const tracer = smoothTracer(STOPS)

        tracer.placePartialStop(STOPS, 2, 0.5)

        const ctx = traceSlice(tracer, 2, 1, 2)

        expect(ctx.bezierCurveTo.mock.calls.map(call => ({ x: call[4], y: call[5] })))
            .toEqual([tracer.partialStop])
    })
})