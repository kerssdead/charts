import { capFadeGradient } from '@/helpers/Canvas'
import { FadeEdge } from '@/static/Enums'

const context = () => {
    const addColorStop = jest.fn()
    const createLinearGradient = jest.fn(() => ({ addColorStop }))

    return {
        ctx: { createLinearGradient } as unknown as CanvasRenderingContext2D,
        createLinearGradient,
        addColorStop
    }
}

const BOX = { x: 10, y: 20, width: 30, height: 40 }

describe('Getting cap fade gradient', () => {
    it('Should fade downwards from the top edge', () => {
        const { ctx, createLinearGradient } = context()

        capFadeGradient(ctx, '#ffffff', FadeEdge.Top, BOX)

        expect(createLinearGradient)
            .toHaveBeenCalledWith(0, 20, 0, 60)
    })

    it('Should fade leftwards from the right edge', () => {
        const { ctx, createLinearGradient } = context()

        capFadeGradient(ctx, '#ffffff', FadeEdge.Right, BOX)

        expect(createLinearGradient)
            .toHaveBeenCalledWith(40, 0, 10, 0)
    })

    it('Should go from opaque color to transparent', () => {
        const { ctx, addColorStop } = context()

        capFadeGradient(ctx, '#222222', FadeEdge.Top, BOX)

        expect(addColorStop.mock.calls)
            .toEqual([[0, '#222222'], [1, '#22222200']])
    })
})
