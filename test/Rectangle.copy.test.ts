import Rectangle from '@/helpers/Rectangle'

describe('Copying a rectangle', () => {
    const rectangle = { x: 1, y: 2, width: 3, height: 4 }

    it('Should keep all the values', () => {
        expect(Rectangle.copy(rectangle))
            .toEqual(rectangle)
    })

    it('Should return a new object', () => {
        expect(Rectangle.copy(rectangle))
            .not.toBe(rectangle)
    })
})