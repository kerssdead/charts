import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import { ItemFlag as f } from '@/static/ItemFlag'

describe('Building queue item flags', () => {
    it('Should mark an item as a menu button', () => {
        const items = new QueueItemsBuilder()

        const item = items.rect().menuButton().build()

        expect(item.is(f.MenuButton))
            .toBe(true)
    })

    it('Should mark an item as monochrome', () => {
        const items = new QueueItemsBuilder()

        const item = items.rect().monochrome().build()

        expect(item.is(f.Monochrome))
            .toBe(true)
    })

    it('Should mark an item with a context menu', () => {
        const items = new QueueItemsBuilder()

        const item = items.rect().contextMenu().build()

        expect(item.is(f.ContextMenu))
            .toBe(true)
    })

    it('Should bind a click handler', () => {
        const items = new QueueItemsBuilder()
        const onClick = jest.fn()

        const item = items.rect().onClick(onClick).build()

        item.onClick?.()

        expect(onClick)
            .toHaveBeenCalledTimes(1)
    })

    it('Should build the same shape for the item', () => {
        const items = new QueueItemsBuilder()

        const builder = items.rect()

        expect(builder.build().shape)
            .toBeInstanceOf(RenderItemRectangle)
    })
})
