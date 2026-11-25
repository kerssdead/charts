import QueueImageItemBuilder from '@/builders/QueueImageItemBuilder'

describe('Placing image item in a box', () => {
    it('Should keep the box on the shape', () => {
        expect(new QueueImageItemBuilder('a.png').box(10, 20, 30, 40).shape.box)
            .toEqual({ x: 10, y: 20, width: 30, height: 40 })
    })

    it('Should not have a box by default', () => {
        expect(new QueueImageItemBuilder('a.png').shape.box)
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueImageItemBuilder('a.png')

        expect(builder.box(1, 2, 3, 4))
            .toBe(builder)
    })
})