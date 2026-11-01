import { CurveSegment, getMonotoneSegments } from '@/helpers/MonotoneCurve'
import Point from '@/types/Point'

const SAMPLES_PER_SEGMENT = 50

const sampleSegmentY = (start: Point, { firstControl, secondControl, end }: CurveSegment) => {
    return Array.from({ length: SAMPLES_PER_SEGMENT + 1 }, (_, i) => {
        const t = i / SAMPLES_PER_SEGMENT
        const u = 1 - t

        return u * u * u * start.y
            + 3 * u * u * t * firstControl.y
            + 3 * u * t * t * secondControl.y
            + t * t * t * end.y
    })
}

const sampleCurveY = (stops: Point[]) => {
    return getMonotoneSegments(stops).map((segment, i) => sampleSegmentY(stops[i], segment))
}

describe('Getting monotone curve segments', () => {
    it('Should return no segments without two stops', () => {
        expect([getMonotoneSegments([]), getMonotoneSegments([{ x: 1, y: 1 }])])
            .toEqual([[], []])
    })

    it('Should keep two stops straight', () => {
        expect(getMonotoneSegments([{ x: 0, y: 0 }, { x: 30, y: 60 }]))
            .toEqual([{
                firstControl: { x: 10, y: 20 },
                secondControl: { x: 20, y: 40 },
                end: { x: 30, y: 60 }
            }])
    })

    it('Should end every segment at its stop', () => {
        const stops = [{ x: 0, y: 5 }, { x: 10, y: 20 }, { x: 25, y: 8 }, { x: 30, y: 40 }]

        expect(getMonotoneSegments(stops).map(segment => segment.end))
            .toEqual(stops.slice(1))
    })

    it('Should keep flat stops flat', () => {
        const stops = [{ x: 0, y: 7 }, { x: 10, y: 7 }, { x: 20, y: 7 }]

        expect(getMonotoneSegments(stops).flatMap(segment => [segment.firstControl.y, segment.secondControl.y]))
            .toEqual([7, 7, 7, 7])
    })

    it('Should flatten curve at a peak', () => {
        const [rising, falling] = getMonotoneSegments([{ x: 0, y: 0 }, { x: 10, y: 50 }, { x: 20, y: 0 }])

        expect([rising.secondControl.y, falling.firstControl.y])
            .toEqual([50, 50])
    })

    it('Should not overshoot neighbour stops on uneven spacing', () => {
        const stops = [
            { x: 0, y: 10 },
            { x: 1, y: 90 },
            { x: 40, y: 5 },
            { x: 42, y: 70 },
            { x: 43, y: 72 },
            { x: 100, y: 0 }
        ]

        sampleCurveY(stops).forEach((samples, i) => {
            const lowest = Math.min(stops[i].y, stops[i + 1].y)
            const highest = Math.max(stops[i].y, stops[i + 1].y)

            expect(Math.min(...samples))
                .toBeGreaterThanOrEqual(lowest - 1e-9)

            expect(Math.max(...samples))
                .toBeLessThanOrEqual(highest + 1e-9)
        })
    })

    it('Should keep rising stops rising', () => {
        const stops = [{ x: 0, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 50 }, { x: 30, y: 51 }, { x: 31, y: 90 }]
        const samples = sampleCurveY(stops).flat()

        expect(samples.every((y, i) => i == 0 || y >= samples[i - 1] - 1e-9))
            .toBe(true)
    })

    it('Should keep finite controls for stops on the same x', () => {
        const segments = getMonotoneSegments([{ x: 0, y: 1 }, { x: 0, y: 5 }, { x: 2, y: 3 }])

        expect(segments.every(({ firstControl, secondControl }) => {
            return [firstControl.x, firstControl.y, secondControl.x, secondControl.y].every(Number.isFinite)
        }))
            .toBe(true)
    })

    it('Should not spread a missing value past its neighbour segments', () => {
        const segments = getMonotoneSegments([{ x: 0, y: 1 }, { x: 1, y: NaN }, { x: 2, y: 3 }, { x: 3, y: 4 }])

        expect([segments[2].firstControl.y, segments[2].secondControl.y].every(Number.isFinite))
            .toBe(true)
    })
})