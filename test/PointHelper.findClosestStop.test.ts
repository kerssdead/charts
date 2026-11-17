import PointHelper from '@/helpers/PointHelper'

const inside = () => true

describe('Finding the closest stop', () => {
    const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 0 }]

    it('Should return the closest stop within the distance', () => {
        expect(PointHelper.findClosestStop(STOPS, { x: 9, y: 1 }, 7, { isSortedX: true, isInside: inside }))
            .toBe(1)
    })

    it('Should return -1 when no stop is within the distance', () => {
        expect(PointHelper.findClosestStop(STOPS, { x: 9, y: 100 }, 7, { isSortedX: true, isInside: inside }))
            .toBe(-1)
    })

    it('Should return -1 for an empty line', () => {
        expect(PointHelper.findClosestStop([], { x: 0, y: 0 }, 7, { isSortedX: true, isInside: inside }))
            .toBe(-1)
    })

    it('Should scan unsorted stops', () => {
        const unsorted = [{ x: 30, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }]

        expect(PointHelper.findClosestStop(unsorted, { x: 11, y: 0 }, 7, { isSortedX: false, isInside: inside }))
            .toBe(2)
    })

    it('Should skip stops outside the clip', () => {
        const isInside = (stop: { x: number, y: number }) => stop.x > 10

        expect(PointHelper.findClosestStop(STOPS, { x: 15, y: 0 }, 7, { isSortedX: true, isInside }))
            .toBe(2)
    })
})
