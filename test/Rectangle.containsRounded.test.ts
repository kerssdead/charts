import Rectangle from '@/helpers/Rectangle'

describe('Checking rounded rectangle hit', () => {
    const rectangle = { x: 0, y: 0, width: 100, height: 100 }

    it('Should hit the middle', () => {
        expect(Rectangle.containsRounded(rectangle, 20, { x: 50, y: 50 }))
            .toBe(true)
    })

    it('Should hit inside the rounded corner', () => {
        expect(Rectangle.containsRounded(rectangle, 20, { x: 10, y: 10 }))
            .toBe(true)
    })

    it('Should miss outside the rounded corner', () => {
        expect(Rectangle.containsRounded(rectangle, 20, { x: 1, y: 1 }))
            .toBe(false)
    })

    it('Should hit square edges when the radius is zero', () => {
        expect(Rectangle.containsRounded(rectangle, 0, { x: 0, y: 50 }))
            .toBe(true)
    })
})