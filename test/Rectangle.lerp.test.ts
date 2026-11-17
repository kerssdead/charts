import Rectangle from '@/helpers/Rectangle'

describe('Interpolating rectangles', () => {
    const from = { x: 0, y: 0, width: 10, height: 10 }

    const to = { x: 10, y: 20, width: 30, height: 50 }

    it('Should return the start at zero', () => {
        expect(Rectangle.lerp(from, to, 0))
            .toEqual(from)
    })

    it('Should return the end at one', () => {
        expect(Rectangle.lerp(from, to, 1))
            .toEqual(to)
    })

    it('Should return the middle at half', () => {
        expect(Rectangle.lerp(from, to, .5))
            .toEqual({ x: 5, y: 10, width: 20, height: 30 })
    })
})