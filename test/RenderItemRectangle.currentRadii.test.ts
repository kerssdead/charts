import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Getting current rectangle radii', () => {
    it('Should return radii copy when not morphing', () => {
        const shape = new RenderItemRectangle()

        shape.radii = [4, 4, 0, 0]

        const radii = shape.currentRadii()

        expect([radii, radii === shape.radii])
            .toEqual([[4, 4, 0, 0], false])
    })

    it('Should round growing radii and flatten shrinking radii', () => {
        const shape = new RenderItemRectangle()

        shape.radii = [16, 0, 0, 0]
        shape.fromRadii = [0, 16, 0, 0]

        expect(shape.currentRadii(.5))
            .toEqual([1, 1, 0, 0])
    })

    it('Should write into passed result', () => {
        const shape = new RenderItemRectangle()
        const result = [9, 9, 9, 9, 9]

        shape.radii = [4, 4, 0, 0]

        expect(shape.currentRadii(1, result))
            .toBe(result)
        expect(result)
            .toEqual([4, 4, 0, 0])
    })
})