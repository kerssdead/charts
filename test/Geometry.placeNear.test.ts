import { samePoint, sameRect, copyRect, containsRounded, placeNear } from '@/helpers/Geometry'

describe('Comparing points', () => {
    it('Should detect equal and different points', () => {
        expect(samePoint({ x: 1, y: 2 }, { x: 1, y: 2 }))
            .toBe(true)
        expect(samePoint({ x: 1, y: 2 }, { x: 1, y: 3 }))
            .toBe(false)
    })

    it('Should treat missing points as equal', () => {
        expect(samePoint(undefined, undefined))
            .toBe(true)
        expect(samePoint(null, { x: 1, y: 2 }))
            .toBe(false)
    })
})

describe('Comparing rectangles', () => {
    it('Should detect equal and different rectangles', () => {
        const rect = { x: 1, y: 2, width: 3, height: 4 }

        expect(sameRect(rect, { ...rect }))
            .toBe(true)
        expect(sameRect(rect, { ...rect, height: 5 }))
            .toBe(false)
    })

    it('Should copy a rectangle into a new object', () => {
        const rect = { x: 1, y: 2, width: 3, height: 4 }

        expect(copyRect(rect))
            .toEqual(rect)
        expect(copyRect(rect))
            .not.toBe(rect)
    })
})

describe('Checking rounded rectangle hit', () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 }

    it('Should hit the middle', () => {
        expect(containsRounded(rect, 20, { x: 50, y: 50 }))
            .toBe(true)
    })

    it('Should hit inside the rounded corner', () => {
        expect(containsRounded(rect, 20, { x: 10, y: 10 }))
            .toBe(true)
    })

    it('Should miss outside the rounded corner', () => {
        expect(containsRounded(rect, 20, { x: 1, y: 1 }))
            .toBe(false)
    })

    it('Should hit square edges when the radius is zero', () => {
        expect(containsRounded(rect, 0, { x: 0, y: 50 }))
            .toBe(true)
    })
})

describe('Placing a box near a point', () => {
    const bounds = { x: 0, y: 0, width: 200, height: 200 }

    it('Should place the box right below the point', () => {
        expect(placeNear({ x: 50, y: 50 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 55, y: 55 })
    })

    it('Should flip the box to the other side when it overflows', () => {
        expect(placeNear({ x: 190, y: 50 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 165, y: 55 })
        expect(placeNear({ x: 50, y: 190 }, { width: 20, height: 10 }, 5, bounds))
            .toEqual({ x: 55, y: 175 })
    })

    it('Should clamp the position to the bounds origin', () => {
        expect(placeNear({ x: 3, y: 3 }, { width: 20, height: 10 }, 5, { x: 10, y: 10, width: 200, height: 200 }))
            .toEqual({ x: 10, y: 10 })
    })
})
