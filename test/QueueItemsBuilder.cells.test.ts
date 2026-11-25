import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemCells from '@/types/RenderItemCells'

describe('Adding a cells item', () => {
    it('Should build an item with a cells shape', () => {
        const items = new QueueItemsBuilder()

        items.cells().key('cells')

        const [item] = items.build()

        expect(item.shape)
            .toBeInstanceOf(RenderItemCells)
        expect(item.key)
            .toBe('cells')
    })

    it('Should keep the order of items', () => {
        const items = new QueueItemsBuilder()

        items.rect().key('first')
        items.cells().key('second')
        items.text('text').key('third')

        expect(items.build().map(item => item.key))
            .toEqual(['first', 'second', 'third'])
    })
})