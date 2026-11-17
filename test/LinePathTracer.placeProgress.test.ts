import LinePathTracer from '@/helpers/LinePathTracer'

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 10 }]

describe('Placing line progress', () => {
    it('Should return the stop index and place the partial stop', () => {
        const tracer = new LinePathTracer()

        expect(tracer.placeProgress(STOPS, 0.5))
            .toBe(2)
        expect(tracer.partialStop)
            .toEqual({ x: 10, y: 5 })
    })

    it('Should return the last stop at full progress', () => {
        expect(new LinePathTracer().placeProgress(STOPS, 1))
            .toBe(STOPS.length)
    })

    it('Should compute segment lengths once for the same stops', () => {
        const tracer = new LinePathTracer()
        const hypot = jest.spyOn(Math, 'hypot')

        tracer.placeProgress(STOPS, 0.5)
        tracer.placeProgress(STOPS, 0.25)
        tracer.placeProgress(STOPS, 0.75)

        expect(hypot)
            .toHaveBeenCalledTimes(3)

        hypot.mockRestore()
    })

    it('Should recompute lengths for a new stops array', () => {
        const tracer = new LinePathTracer()
        const moved = STOPS.map(stop => ({ x: stop.x, y: stop.y + 100 }))
        const hypot = jest.spyOn(Math, 'hypot')

        tracer.placeProgress(STOPS, 0.5)
        tracer.placeProgress(moved, 0.5)

        expect(hypot)
            .toHaveBeenCalledTimes(6)

        hypot.mockRestore()
    })

    it('Should recompute lengths every frame while morphing', () => {
        const tracer = new LinePathTracer()

        tracer.updateCurve(STOPS, true)

        const hypot = jest.spyOn(Math, 'hypot')

        tracer.placeProgress(STOPS, 0.5)
        tracer.placeProgress(STOPS, 0.5)

        expect(hypot)
            .toHaveBeenCalledTimes(6)

        hypot.mockRestore()
    })

    it('Should place the start of a zero length segment for negative progress', () => {
        const tracer = new LinePathTracer()
        const stops = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }]

        expect(tracer.placeProgress(stops, -0.5))
            .toBe(1)
        expect(tracer.partialStop)
            .toEqual({ x: 0, y: 0 })
    })
})