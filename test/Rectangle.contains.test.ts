import Rectangle from '@/helpers/Rectangle'

describe('Checking rectangle hit', () => {
    const rectangle = { x: 10, y: 20, width: 100, height: 50 }

    it('Should hit inside', () => {
        expect(Rectangle.contains(rectangle, { x: 50, y: 40 }))
            .toBe(true)
    })

    it('Should hit the edges', () => {
        expect(Rectangle.contains(rectangle, { x: 10, y: 20 }))
            .toBe(true)
        expect(Rectangle.contains(rectangle, { x: 110, y: 70 }))
            .toBe(true)
    })

    it('Should miss outside', () => {
        expect(Rectangle.contains(rectangle, { x: 9, y: 40 }))
            .toBe(false)
        expect(Rectangle.contains(rectangle, { x: 50, y: 71 }))
            .toBe(false)
    })

    it('Should miss without a point', () => {
        expect(Rectangle.contains(rectangle, null))
            .toBe(false)
    })
})