import QueueCellsItemBuilder from '@/builders/QueueCellsItemBuilder'

describe('Giving cells item its data lookup', () => {
    it('Should use the given lookup', () => {
        const lookup = jest.fn(() => ({ id: 'a' }))

        expect(new QueueCellsItemBuilder().dataLookup(lookup).shape.dataLookup(3))
            .toEqual({ id: 'a' })
        expect(lookup)
            .toHaveBeenCalledWith(3)
    })

    it('Should give no data without a lookup', () => {
        expect(new QueueCellsItemBuilder().shape.dataLookup(0))
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueCellsItemBuilder()

        expect(builder.dataLookup(() => null))
            .toBe(builder)
    })
})