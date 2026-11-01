import { splitCurveSegment } from '@/helpers/MonotoneCurve'

const START = { x: 0, y: 0 }

const SEGMENT = {
    firstControl: { x: 1, y: 2 },
    secondControl: { x: 2, y: 2 },
    end: { x: 3, y: 0 }
}

describe('Splitting curve segment', () => {
    it('Should collapse to start at zero', () => {
        expect(splitCurveSegment(START, SEGMENT, 0))
            .toEqual({ firstControl: START, secondControl: START, end: START })
    })

    it('Should keep whole segment at one', () => {
        expect(splitCurveSegment(START, SEGMENT, 1))
            .toEqual(SEGMENT)
    })

    it('Should stop on the curve at the middle', () => {
        expect(splitCurveSegment(START, SEGMENT, 0.5))
            .toEqual({
                firstControl: { x: 0.5, y: 1 },
                secondControl: { x: 1, y: 1.5 },
                end: { x: 1.5, y: 1.5 }
            })
    })

    it('Should follow the same curve when split again', () => {
        const half = splitCurveSegment(START, SEGMENT, 0.5)

        expect(splitCurveSegment(START, half, 0.5).end)
            .toEqual(splitCurveSegment(START, SEGMENT, 0.25).end)
    })
})