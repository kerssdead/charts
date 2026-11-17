import PointHelper from '@/helpers/PointHelper'

describe('Comparing points', () => {
    it('Should detect equal and different points', () => {
        expect(PointHelper.same({ x: 1, y: 2 }, { x: 1, y: 2 }))
            .toBe(true)
        expect(PointHelper.same({ x: 1, y: 2 }, { x: 1, y: 3 }))
            .toBe(false)
    })

    it('Should treat missing points as equal', () => {
        expect(PointHelper.same(undefined, undefined))
            .toBe(true)
        expect(PointHelper.same(null, { x: 1, y: 2 }))
            .toBe(false)
    })
})