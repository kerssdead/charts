import FocusRing from '@/renderer/FocusRing'
import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import { Bounds } from '@/types/interfaces/RenderItemBase'
import { LIGHT_THEME } from '@/Theme'

const create = (bounds: Bounds | null) => {
    const queue = new Queue({} as CanvasRenderingContext2D)
    const state = { bounds }
    const ring = new FocusRing(() => state.bounds)
    const update = (screen = { width: 100, height: 100 }) => {
        return ring.update({ queue, screen, theme: LIGHT_THEME } as unknown as Frame)
    }

    return { queue, state, ring, update }
}

const BOUNDS = { left: 10, top: 20, right: 40, bottom: 60 }

describe('Updating focus ring', () => {
    it('Should draw a rectangle around the bounds', () => {
        const { queue, update } = create(BOUNDS)

        update()

        const shape = queue.items[0].shape as RenderItemRectangle

        expect([queue.items.length, shape.isFill, shape.absolute.width, shape.absolute.height])
            .toEqual([1, true, 1500, 2000])
    })

    it('Should draw the ring above the legend in the theme text color', () => {
        const { queue, update } = create(BOUNDS)

        update()

        expect([queue.items[0].stroke, queue.items[0].is(8)])
            .toEqual([LIGHT_THEME.text, true])
        expect(queue.items[0].layer)
            .toBeGreaterThan(700)
    })

    it('Should not touch the queue while the bounds are the same', () => {
        const { queue, update } = create(BOUNDS)

        update()

        const version = queue.version

        update()

        expect(queue.version)
            .toBe(version)
    })

    it('Should redraw when the bounds change', () => {
        const { queue, state, update } = create(BOUNDS)

        update()
        state.bounds = { ...BOUNDS, right: 50 }
        update()

        const shape = queue.items[0].shape as RenderItemRectangle

        expect([queue.items.length, shape.absolute.width])
            .toEqual([1, 2000])
    })

    it('Should remove the ring when there are no bounds', () => {
        const { queue, state, update } = create(BOUNDS)

        update()
        state.bounds = null
        update()

        expect(queue.items.length)
            .toBe(0)
    })

    it('Should not draw on an empty screen', () => {
        const { queue, update } = create(BOUNDS)

        update({ width: 0, height: 0 })

        expect(queue.items.length)
            .toBe(0)
    })

    it('Should never request another frame', () => {
        const { update } = create(BOUNDS)

        expect(update())
            .toBe(false)
    })
})