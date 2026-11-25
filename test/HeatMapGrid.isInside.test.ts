import { isInside } from '@/render/heatMap/HeatMapGrid'

const EXTENT = { width: 100, height: 50 }

describe('Checking a point is inside the extent', () => {
    it('Should accept points inside', () => {
        expect(isInside(10, 10, EXTENT))
            .toBe(true)
    })

    it('Should accept points on the edges', () => {
        expect(isInside(0, 0, EXTENT))
            .toBe(true)
        expect(isInside(100, 50, EXTENT))
            .toBe(true)
    })

    it('Should reject points outside', () => {
        expect(isInside(-1, 10, EXTENT))
            .toBe(false)
        expect(isInside(10, -1, EXTENT))
            .toBe(false)
        expect(isInside(101, 10, EXTENT))
            .toBe(false)
        expect(isInside(10, 51, EXTENT))
            .toBe(false)
    })
})