import Rectangle from '@/helpers/Rectangle'

describe('Creating an empty rectangle', () => {
    it('Should be positioned at the origin with no size', () => {
        expect(Rectangle.empty())
            .toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })

    it('Should return a new object on every call', () => {
        const rectangle = Rectangle.empty()

        rectangle.width = 10

        expect(Rectangle.empty().width)
            .toBe(0)
    })
})