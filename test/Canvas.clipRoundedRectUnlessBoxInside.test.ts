import { clipRoundedRectUnlessBoxInside } from '@/helpers/Canvas'

const CLIP = { x: 0, y: 0, width: 200, height: 40 }

const context = () => ({
    lineWidth: 2,
    save: jest.fn(),
    rect: jest.fn(),
    roundRect: jest.fn(),
    clip: jest.fn(),
    beginPath: jest.fn()
})

const clip = (box: { x: number, y: number, width: number, height: number }) => {
    const ctx = context()
    const isClipped = clipRoundedRectUnlessBoxInside(ctx as unknown as CanvasRenderingContext2D, CLIP, 20, box)

    return { ctx, isClipped }
}

describe('Clipping to rounded rectangle unless box is inside', () => {
    it('Should skip the clip for a box inside the rounded rectangle', () => {
        const { ctx, isClipped } = clip({ x: 40, y: 0, width: 100, height: 40 })

        expect([isClipped, ctx.save.mock.calls.length, ctx.clip.mock.calls.length])
            .toEqual([false, 0, 0])
    })

    it('Should clip to the rounded rectangle for a box reaching into a rounded end', () => {
        const { ctx, isClipped } = clip({ x: 0, y: 0, width: 40, height: 40 })

        expect(isClipped)
            .toBe(true)
        expect(ctx.save)
            .toHaveBeenCalled()
        expect(ctx.roundRect)
            .toHaveBeenCalledWith(0, 0, 200, 40, 20)
        expect(ctx.clip)
            .toHaveBeenCalled()
    })

    it('Should first clip to the box area widened by the line width', () => {
        const { ctx } = clip({ x: 40, y: 0, width: -40, height: 40 })

        expect(ctx.rect)
            .toHaveBeenCalledWith(-2, -2, 44, 44)
        expect(ctx.rect.mock.invocationCallOrder[0])
            .toBeLessThan(ctx.roundRect.mock.invocationCallOrder[0])
    })

    it('Should start a new path after clipping', () => {
        const { ctx } = clip({ x: 0, y: 0, width: 40, height: 40 })

        expect(Math.max(...ctx.beginPath.mock.invocationCallOrder))
            .toBeGreaterThan(Math.max(...ctx.clip.mock.invocationCallOrder))
    })
})