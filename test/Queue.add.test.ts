import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

jest.mock('@/Theme', () => ({}))

describe('Adding items to queue', () => {
    it('Should add more items than the call stack argument limit', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const items = Array.from({ length: 200000 }, () => new RenderItem(new RenderItemRectangle()))

        queue.add(items)

        expect(queue.findTop(() => true)).toBe(items[items.length - 1])
    })
})