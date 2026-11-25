import Rectangle from '@/helpers/Rectangle'

describe('Turning a rectangle into bounds', () => {
    it('Should give the edges of the rectangle', () => {
        expect(Rectangle.toBounds({ x: 10, y: 20, width: 30, height: 40 }))
            .toEqual({ left: 10, top: 20, right: 40, bottom: 60 })
    })

    it('Should give a point for an empty rectangle', () => {
        expect(Rectangle.toBounds({ x: 5, y: 6, width: 0, height: 0 }))
            .toEqual({ left: 5, top: 6, right: 5, bottom: 6 })
    })
})