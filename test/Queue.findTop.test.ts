import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

jest.mock('@/Theme', () => ({}))

function item(key: string, layer: number) {
    const result = new RenderItem(new RenderItemRectangle())

    result.key = key
    result.layer = layer

    return result
}

describe('Finding topmost queue item', () => {
    it('Should return the item with the highest layer, the last added one among equal layers', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item('stop', 2), item('part-a', 1), item('part-b', 1), item('label', 0)])

        expect(queue.findTop(() => true)?.key).toBe('stop')
        expect(queue.findTop(item => item.layer == 1)?.key).toBe('part-b')
        expect(queue.findTop(item => item.key == 'none')).toBeUndefined()
    })
})
