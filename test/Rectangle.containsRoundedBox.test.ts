import Rectangle from '@/helpers/Rectangle'

describe('Checking box inside rounded rectangle', () => {
    const rectangle = { x: 0, y: 0, width: 200, height: 40 }

    it('Should contain a box in the straight middle part', () => {
        expect(Rectangle.containsRoundedBox(rectangle, 20, { x: 20, y: 0, width: 160, height: 40 }))
            .toBe(true)
    })

    it('Should not contain a box reaching into a rounded end', () => {
        expect(Rectangle.containsRoundedBox(rectangle, 20, { x: 0, y: 0, width: 50, height: 40 }))
            .toBe(false)
    })

    it('Should not contain a box sticking out of the rectangle', () => {
        expect(Rectangle.containsRoundedBox(rectangle, 0, { x: 150, y: 0, width: 60, height: 40 }))
            .toBe(false)
    })

    it('Should contain a box touching square edges when the radius is zero', () => {
        expect(Rectangle.containsRoundedBox(rectangle, 0, rectangle))
            .toBe(true)
    })

    it('Should check the corners of a box with negative width', () => {
        expect(Rectangle.containsRoundedBox(rectangle, 20, { x: 60, y: 0, width: -60, height: 40 }))
            .toBe(false)
    })
})