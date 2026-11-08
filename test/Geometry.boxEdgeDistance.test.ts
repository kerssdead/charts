import { boxEdgeDistance } from '@/helpers/Geometry'

const HALF_WIDTH = 50

const HALF_HEIGHT = 20

const DISTANCE = 100

const nearestBoxPointDistance = (angle: number, centerDistance: number) => {
    const x = Math.max(Math.abs(centerDistance * Math.cos(angle)) - HALF_WIDTH, 0)
    const y = Math.max(Math.abs(centerDistance * Math.sin(angle)) - HALF_HEIGHT, 0)

    return Math.hypot(x, y)
}

const touchingDistance = (angle: number) => {
    const push = boxEdgeDistance(angle, HALF_WIDTH, HALF_HEIGHT, DISTANCE)

    return nearestBoxPointDistance(angle, DISTANCE + push)
}

describe('Getting box edge distance', () => {
    it('Should return half height for vertical angle', () => {
        expect(boxEdgeDistance(Math.PI / 2, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(HALF_HEIGHT)
    })

    it('Should return half width for horizontal angle', () => {
        expect(boxEdgeDistance(0, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(HALF_WIDTH)
    })

    it('Should touch the circle with top or bottom edge', () => {
        expect(boxEdgeDistance(1.4, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(21.77)
        expect(touchingDistance(1.4))
            .toBeCloseTo(DISTANCE)
    })

    it('Should touch the circle with left or right edge', () => {
        expect(boxEdgeDistance(.1, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(50.75)
        expect(touchingDistance(.1))
            .toBeCloseTo(DISTANCE)
    })

    it('Should touch the circle with a corner', () => {
        expect(touchingDistance(Math.PI / 4))
            .toBeCloseTo(DISTANCE)
    })

    it('Should be symmetric in all quadrants', () => {
        const distance = boxEdgeDistance(Math.PI / 4, HALF_WIDTH, HALF_HEIGHT, DISTANCE)

        for (const angle of [3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4])
            expect(boxEdgeDistance(angle, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
                .toBeCloseTo(distance)
    })
})