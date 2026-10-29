import { fadingGradient } from '@/helpers/Canvas'

const context = () => {
    const addColorStop = jest.fn()
    const createLinearGradient = jest.fn(() => ({ addColorStop }))

    return { ctx: { createLinearGradient } as unknown as CanvasRenderingContext2D, createLinearGradient, addColorStop }
}

describe('Getting fading gradient', () => {
    it('Should span gradient from top to bottom', () => {
        const { ctx, createLinearGradient } = context()

        fadingGradient(ctx, '#336699', 50, 10)

        expect(createLinearGradient)
            .toHaveBeenCalledWith(0, 10, 0, 50)
    })

    it('Should fade from color to transparent', () => {
        const { ctx, addColorStop } = context()

        fadingGradient(ctx, '#33669980', 10, 50)

        expect(addColorStop.mock.calls)
            .toEqual([[0, '#33669980'], [1, '#33669900']])
    })
})