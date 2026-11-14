import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

const context = () => ({}) as CanvasRenderingContext2D

const item = (key: string) => {
    const result = new RenderItem(new RenderItemRectangle())

    result.key = key

    return result
}

describe('Removing queue items', () => {
    it('Should remove the items of the set', () => {
        const queue = new Queue(context())
        const removed = item('removed')
        const kept = item('kept')

        queue.add([removed, kept])
        queue.remove(new Set([removed]))

        expect(queue.items.map(i => i.key))
            .toEqual(['kept'])
    })

    it('Should do nothing for an empty set', () => {
        const queue = new Queue(context())
        const kept = item('kept')

        queue.add([kept])

        const version = queue.version

        queue.remove(new Set())

        expect(queue.version)
            .toBe(version)
        expect(queue.items.map(i => i.key))
            .toEqual(['kept'])
    })
})
