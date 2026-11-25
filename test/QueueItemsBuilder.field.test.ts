import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemField from '@/types/RenderItemField'

describe('Adding a field item', () => {
    it('Should build an item with a field shape', () => {
        const items = new QueueItemsBuilder()

        items.field().key('field')

        const [item] = items.build()

        expect(item.shape)
            .toBeInstanceOf(RenderItemField)
        expect(item.key)
            .toBe('field')
    })

    it('Should keep the order of items', () => {
        const items = new QueueItemsBuilder()

        items.rect().key('first')
        items.field().key('second')
        items.text('text').key('third')

        expect(items.build().map(item => item.key))
            .toEqual(['first', 'second', 'third'])
    })
})