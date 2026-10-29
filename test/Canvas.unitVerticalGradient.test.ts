import { unitVerticalGradient } from '@/helpers/Canvas'

const context = () => {
    const createLinearGradient = jest.fn(() => ({ addColorStop: jest.fn() }))

    return { ctx: { createLinearGradient } as unknown as CanvasRenderingContext2D, createLinearGradient }
}

describe('Getting unit vertical gradient', () => {
    it('Should span gradient from 0 to 1', () => {
        const { ctx, createLinearGradient } = context()

        unitVerticalGradient(ctx, '#336699')

        expect(createLinearGradient)
            .toHaveBeenCalledWith(0, 0, 0, 1)
    })

    it('Should reuse gradient for the same context and color', () => {
        const { ctx, createLinearGradient } = context()

        const first = unitVerticalGradient(ctx, '#336699')
        const second = unitVerticalGradient(ctx, '#336699')

        expect([second, createLinearGradient.mock.calls.length])
            .toEqual([first, 1])
    })

    it('Should create separate gradients for different colors', () => {
        const { ctx, createLinearGradient } = context()

        unitVerticalGradient(ctx, '#336699')
        unitVerticalGradient(ctx, '#996633')

        expect(createLinearGradient)
            .toHaveBeenCalledTimes(2)
    })

    it('Should create separate gradients for different contexts', () => {
        const first = context()
        const second = context()

        unitVerticalGradient(first.ctx, '#336699')
        unitVerticalGradient(second.ctx, '#336699')

        expect([first.createLinearGradient.mock.calls.length, second.createLinearGradient.mock.calls.length])
            .toEqual([1, 1])
    })
})