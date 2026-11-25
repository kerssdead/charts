import QueueFieldItemBuilder from '@/builders/QueueFieldItemBuilder'

describe('Placing field item in a box', () => {
    it('Should keep the box on the shape', () => {
        const builder = new QueueFieldItemBuilder().box(10, 20, 30, 40)

        expect(builder.shape.box)
            .toEqual({ x: 10, y: 20, width: 30, height: 40 })
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueFieldItemBuilder()

        expect(builder.box(1, 2, 3, 4))
            .toBe(builder)
    })
})