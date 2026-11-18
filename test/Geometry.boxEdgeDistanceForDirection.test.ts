import { boxEdgeDistance, boxEdgeDistanceForDirection } from '@/helpers/Geometry'

const HALF_WIDTH = 50

const HALF_HEIGHT = 20

const DISTANCE = 100

const direction = (angle: number) => ({ x: Math.cos(angle), y: Math.sin(angle) })

describe('Getting box edge distance for direction', () => {
    it('Should return half width for horizontal direction', () => {
        expect(boxEdgeDistanceForDirection({ x: 1, y: 0 }, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(HALF_WIDTH)
    })

    it('Should return half height for vertical direction', () => {
        expect(boxEdgeDistanceForDirection({ x: 0, y: 1 }, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
            .toBeCloseTo(HALF_HEIGHT)
    })

    it('Should match distance for the same angle', () => {
        for (const angle of [.1, Math.PI / 4, 1.4, 2.5, -2])
            expect(boxEdgeDistanceForDirection(direction(angle), HALF_WIDTH, HALF_HEIGHT, DISTANCE))
                .toBe(boxEdgeDistance(angle, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
    })

    it('Should not depend on direction signs', () => {
        const distance = boxEdgeDistanceForDirection({ x: .6, y: .8 }, HALF_WIDTH, HALF_HEIGHT, DISTANCE)

        for (const mirrored of [{ x: -.6, y: .8 }, { x: .6, y: -.8 }, { x: -.6, y: -.8 }])
            expect(boxEdgeDistanceForDirection(mirrored, HALF_WIDTH, HALF_HEIGHT, DISTANCE))
                .toBe(distance)
    })
})