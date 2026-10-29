import RenderItemLine from '@/types/RenderItemLine'
import RenderItem from '@/types/RenderItem'

const context = () => ({
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    setLineDash: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn()
})

const render = (stops: { x: number, y: number }[], progress: number) => {
    const ctx = context()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    shape.canvas = stops
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return ctx
}

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 10 }]

describe('Rendering line', () => {
    it('Should draw all stops when initialized', () => {
        const ctx = render(STOPS, 1)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[10, 0], [10, 10], [20, 10]]])
    })

    it('Should draw line up to progress length', () => {
        const ctx = render(STOPS, .5)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[10, 0], [10, 5]]])
    })

    it('Should end partial line on stop when progress reaches it', () => {
        const ctx = render(STOPS, 2 / 3)

        expect(ctx.lineTo.mock.calls)
            .toEqual([[10, 0], [10, 10], [10, 10]])
    })

    it('Should draw degenerate segment at zero progress', () => {
        const ctx = render(STOPS, 0)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[0, 0]]])
    })

    it('Should draw point for single stop', () => {
        const ctx = render([{ x: 5, y: 5 }], 1)

        expect([ctx.arc.mock.calls.length, ctx.moveTo.mock.calls.length])
            .toEqual([1, 0])
    })

    it('Should not keep partial stops between frames', () => {
        const ctx = context()
        const shape = new RenderItemLine()
        const item = new RenderItem(shape)

        shape.canvas = STOPS

        for (const progress of [.5, 1]) {
            item.animation.init = progress
            shape.render(ctx as unknown as CanvasRenderingContext2D, item)
        }

        expect(ctx.lineTo.mock.calls.slice(2))
            .toEqual([[10, 0], [10, 10], [20, 10]])
    })
})