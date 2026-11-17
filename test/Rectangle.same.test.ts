import Rectangle from '@/helpers/Rectangle'

describe('Comparing rectangles', () => {
    const rectangle = { x: 1, y: 2, width: 3, height: 4 }

    it('Should detect equal rectangles', () => {
        expect(Rectangle.same(rectangle, { ...rectangle }))
            .toBe(true)
    })

    it('Should detect different rectangles', () => {
        expect(Rectangle.same(rectangle, { ...rectangle, height: 5 }))
            .toBe(false)
    })
})