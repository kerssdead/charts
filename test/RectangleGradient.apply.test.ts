import RectangleGradient from '@/helpers/RectangleGradient'
import { gradientContext } from './RectangleGradientTestData'

const COLOR = '#336699'

describe('Applying rectangle gradient', () => {
    it('Should scale unit gradient to the rectangle when it is drawn first time', () => {
        const { ctx, canvas, createLinearGradient } = gradientContext()

        new RectangleGradient().apply(canvas, COLOR, 10, 40)

        expect([
            ctx.save.mock.calls.length,
            ctx.translate.mock.calls,
            ctx.scale.mock.calls,
            ctx.lineWidth,
            createLinearGradient.mock.calls
        ])
            .toEqual([1, [[0, 10]], [[40, 40]], 1 / 40, [[0, 0, 0, 1]]])
    })

    it('Should translate to the bottom edge for negative height', () => {
        const { ctx, canvas } = gradientContext()

        new RectangleGradient().apply(canvas, COLOR, 50, -40)

        expect([ctx.translate.mock.calls, ctx.scale.mock.calls])
            .toEqual([[[0, 10]], [[40, 40]]])
    })

    it('Should use canvas gradient without transform when rectangle is unchanged', () => {
        const { ctx, canvas, createLinearGradient } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.restore(canvas)
        ctx.save.mockClear()
        createLinearGradient.mockClear()

        gradient.apply(canvas, COLOR, 10, 40)

        expect([ctx.save.mock.calls.length, createLinearGradient.mock.calls, ctx.fillStyle, ctx.strokeStyle])
            .toEqual([0, [[0, 10, 0, 50]], createLinearGradient.mock.results[0].value, ctx.fillStyle])
    })

    it('Should reuse canvas gradient while rectangle stays unchanged', () => {
        const { canvas, createLinearGradient } = gradientContext()
        const gradient = new RectangleGradient()

        for (let i = 0; i < 4; i++)
            gradient.apply(canvas, COLOR, 10, 40)

        expect(createLinearGradient.mock.calls)
            .toEqual([[0, 0, 0, 1], [0, 10, 0, 50]])
    })

    it('Should return to unit gradient when rectangle changes', () => {
        const { ctx, canvas } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.apply(canvas, COLOR, 10, 40)
        gradient.apply(canvas, COLOR, 10, 45)

        expect(ctx.scale.mock.calls)
            .toEqual([[40, 40], [45, 45]])
    })

    it('Should return to unit gradient when color changes', () => {
        const { ctx, canvas } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.apply(canvas, COLOR, 10, 40)
        gradient.apply(canvas, '#996633', 10, 40)

        expect(ctx.save)
            .toHaveBeenCalledTimes(2)
    })
})