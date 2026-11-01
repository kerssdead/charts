import LinePathTracer from '@/render/LinePathTracer'
import { getMonotoneSegments, splitCurveSegment } from '@/helpers/MonotoneCurve'
import { LineDrawMode } from '@/static/Enums'

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 30 }, { x: 20, y: 35 }, { x: 30, y: 90 }]

const smoothTracer = () => {
    const tracer = new LinePathTracer(LineDrawMode.Smooth)

    tracer.updateCurve(STOPS)

    return tracer
}

describe('Placing line partial stop', () => {
    it('Should place straight stop on the chord', () => {
        const tracer = new LinePathTracer()

        tracer.placePartialStop(STOPS, 1, 0.5)

        expect(tracer.partialStop)
            .toEqual({ x: 5, y: 15 })
    })

    it('Should place smooth stop on the curve', () => {
        const tracer = smoothTracer()

        tracer.placePartialStop(STOPS, 2, 0.25)

        expect(tracer.partialStop)
            .toEqual(splitCurveSegment(STOPS[1], getMonotoneSegments(STOPS)[1], 0.25).end)
    })

    it('Should leave the chord in smooth mode', () => {
        const tracer = smoothTracer()

        tracer.placePartialStop(STOPS, 2, 0.25)

        expect(tracer.partialStop.y)
            .not.toBeCloseTo(31.25)
    })

    it('Should start at the previous stop at zero progress', () => {
        const tracer = smoothTracer()

        tracer.placePartialStop(STOPS, 2, 0)

        expect(tracer.partialStop)
            .toEqual(STOPS[1])
    })

    it('Should replace the previous partial stop', () => {
        const tracer = new LinePathTracer()

        tracer.placePartialStop(STOPS, 1, 0.5)
        tracer.placePartialStop(STOPS, 2, 1)

        expect(tracer.partialStop)
            .toEqual(STOPS[2])
    })
})