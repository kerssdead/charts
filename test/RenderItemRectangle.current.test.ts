import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Getting current rectangle', () => {
    it('Should interpolate from previous rectangle', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 100, y: 200, width: 50, height: 40 }
        shape.from = { x: 0, y: 0, width: 10, height: 20 }

        expect(shape.current(.5))
            .toEqual({ x: 50, y: 100, width: 30, height: 30 })
    })

    it('Should write into passed result', () => {
        const shape = new RenderItemRectangle()
        const result = { x: 0, y: 0, width: 0, height: 0 }

        shape.absolute = { x: 100, y: 200, width: 50, height: 40 }

        expect(shape.current(1, result))
            .toBe(result)
        expect(result)
            .toEqual({ x: 100, y: 200, width: 50, height: 40 })
    })

    it('Should not share absolute object', () => {
        const shape = new RenderItemRectangle()

        expect(shape.current())
            .not.toBe(shape.absolute)
    })
})