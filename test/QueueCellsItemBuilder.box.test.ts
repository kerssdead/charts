import QueueCellsItemBuilder from '@/builders/QueueCellsItemBuilder'

describe('Placing cells item in a box', () => {
    it('Should keep the box on the shape', () => {
        const builder = new QueueCellsItemBuilder().box(10, 20, 30, 40)

        expect(builder.shape.box)
            .toEqual({ x: 10, y: 20, width: 30, height: 40 })
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueCellsItemBuilder()

        expect(builder.box(1, 2, 3, 4))
            .toBe(builder)
    })
})