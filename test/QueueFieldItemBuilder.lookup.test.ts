import QueueFieldItemBuilder from '@/builders/QueueFieldItemBuilder'

describe('Giving field item its tooltip lookup', () => {
    it('Should use the given lookup', () => {
        const lookup = jest.fn(() => 'text')

        expect(new QueueFieldItemBuilder().lookup(lookup).shape.lookup(.1, .2))
            .toBe('text')
        expect(lookup)
            .toHaveBeenCalledWith(.1, .2)
    })

    it('Should describe nothing without a lookup', () => {
        expect(new QueueFieldItemBuilder().shape.lookup(.5, .5))
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueFieldItemBuilder()

        expect(builder.lookup(() => null))
            .toBe(builder)
    })
})