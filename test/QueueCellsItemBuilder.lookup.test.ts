import QueueCellsItemBuilder from '@/builders/QueueCellsItemBuilder'

describe('Giving cells item its tooltip lookup', () => {
    it('Should use the given lookup', () => {
        const lookup = jest.fn(() => 'text')

        expect(new QueueCellsItemBuilder().lookup(lookup).shape.lookup(3))
            .toBe('text')
        expect(lookup)
            .toHaveBeenCalledWith(3)
    })

    it('Should describe nothing without a lookup', () => {
        expect(new QueueCellsItemBuilder().shape.lookup(0))
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueCellsItemBuilder()

        expect(builder.lookup(() => null))
            .toBe(builder)
    })
})