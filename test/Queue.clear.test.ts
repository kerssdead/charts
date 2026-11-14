import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Clearing queue', () => {
    it('Should drop all items and bump the version', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const item = new RenderItem(new RenderItemRectangle())

        item.key = 'item'

        queue.add([item])

        const version = queue.version

        queue.clear()

        expect(queue.items)
            .toEqual([])
        expect(queue.version)
            .toBe(version + 1)
        expect(queue.isAnimating)
            .toBe(false)
    })
})
