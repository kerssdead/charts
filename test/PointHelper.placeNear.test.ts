import PointHelper from '@/helpers/PointHelper'

describe('Placing a box near a point', () => {
    const bounds = { x: 0, y: 0, width: 200, height: 200 }

    it('Should place the box right below the point', () => {
        expect(PointHelper.placeNear({ x: 50, y: 50 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 55, y: 55 })
    })

    it('Should flip the box to the other side when it overflows', () => {
        expect(PointHelper.placeNear({ x: 190, y: 50 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 165, y: 55 })
        expect(PointHelper.placeNear({ x: 50, y: 190 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 55, y: 175 })
    })

    it('Should clamp the position to the bounds origin', () => {
        const offsetBounds = { x: 10, y: 10, width: 200, height: 200 }

        expect(PointHelper.placeNear({ x: 3, y: 3 }, { width: 20, height: 10 }, 5, offsetBounds))
            .toEqual({ x: 10, y: 10 })
    })
})
