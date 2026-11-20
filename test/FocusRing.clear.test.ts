import FocusRing from '@/renderer/FocusRing'
import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'
import { LIGHT_THEME } from '@/Theme'

describe('Clearing focus ring', () => {
    it('Should remove the ring and draw it again on the next update', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const ring = new FocusRing(() => ({ left: 0, top: 0, right: 10, bottom: 10 }))
        const frame = { queue, screen: { width: 100, height: 100 }, theme: LIGHT_THEME } as unknown as Frame

        ring.update(frame)
        ring.clear(queue)

        const cleared = queue.items.length

        ring.update(frame)

        expect([cleared, queue.items.length])
            .toEqual([0, 1])
    })
})