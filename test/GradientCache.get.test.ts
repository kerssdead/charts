import { GradientCache, verticalGradient } from '@/helpers/Canvas'

const context = () => {
    const addColorStop = jest.fn()
    const createLinearGradient = jest.fn(() => ({ addColorStop }))

    return { ctx: { createLinearGradient } as unknown as CanvasRenderingContext2D, createLinearGradient, addColorStop }
}

const gradientFactory = () => jest.fn(() => ({}) as CanvasGradient)

describe('Getting cached gradient', () => {
    it('Should create gradient with given factory', () => {
        const { ctx } = context()
        const createGradient = gradientFactory()
        const gradient = new GradientCache(createGradient).get(ctx, '#336699', 10, 50)

        expect([gradient, createGradient.mock.calls])
            .toEqual([createGradient.mock.results[0].value, [[ctx, '#336699', 10, 50]]])
    })

    it('Should reuse gradient for the same color and range', () => {
        const { ctx } = context()
        const createGradient = gradientFactory()
        const cache = new GradientCache(createGradient)

        const first = cache.get(ctx, '#336699', 10, 50)
        const second = cache.get(ctx, '#336699', 10, 50)

        expect([second, createGradient.mock.calls.length])
            .toEqual([first, 1])
    })

    it('Should recreate gradient when range or color changes', () => {
        const { ctx } = context()
        const createGradient = gradientFactory()
        const cache = new GradientCache(createGradient)

        cache.get(ctx, '#336699', 10, 50)
        cache.get(ctx, '#336699', 10, 60)
        cache.get(ctx, '#996633', 10, 60)

        expect(createGradient)
            .toHaveBeenCalledTimes(3)
    })

    it('Should use vertical gradient by default', () => {
        const cached = context()
        const direct = context()

        new GradientCache().get(cached.ctx, '#336699', 10, 50)
        verticalGradient(direct.ctx, '#336699', 10, 50)

        expect([cached.createLinearGradient.mock.calls, cached.addColorStop.mock.calls])
            .toEqual([direct.createLinearGradient.mock.calls, direct.addColorStop.mock.calls])
    })
})