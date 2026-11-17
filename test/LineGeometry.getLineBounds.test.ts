import { getLineBounds } from '@/helpers/LineGeometry'

const CANVAS = [{ x: 1, y: 2 }, { x: 3, y: 4 }]

describe('Getting line bounds from canvas stops', () => {
    it('Should pad the stops by the given amount', () => {
        expect(getLineBounds(CANVAS, 1, null))
            .toEqual({ left: 0, top: 1, right: 4, bottom: 5 })
    })

    it('Should extend bounds down to the baseline', () => {
        expect(getLineBounds(CANVAS, 1, 6))
            .toEqual({ left: 0, top: 1, right: 4, bottom: 7 })
    })

    it('Should return null without stops', () => {
        expect(getLineBounds([], 1, null))
            .toBeNull()
    })
})
