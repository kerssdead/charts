import RectangleGradient from '@/helpers/RectangleGradient'
import { gradientContext } from './RectangleGradientTestData'

const COLOR = '#336699'

describe('Restoring rectangle gradient', () => {
    it('Should restore context after unit gradient', () => {
        const { ctx, canvas } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.restore(canvas)

        expect(ctx.restore)
            .toHaveBeenCalledTimes(1)
    })

    it('Should not restore context after canvas gradient', () => {
        const { ctx, canvas } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.restore(canvas)
        gradient.apply(canvas, COLOR, 10, 40)
        gradient.restore(canvas)

        expect(ctx.restore)
            .toHaveBeenCalledTimes(1)
    })

    it('Should restore context only once per apply', () => {
        const { ctx, canvas } = gradientContext()
        const gradient = new RectangleGradient()

        gradient.apply(canvas, COLOR, 10, 40)
        gradient.restore(canvas)
        gradient.restore(canvas)

        expect(ctx.restore)
            .toHaveBeenCalledTimes(1)
    })

    it('Should do nothing before apply', () => {
        const { ctx, canvas } = gradientContext()

        new RectangleGradient().restore(canvas)

        expect(ctx.restore)
            .not.toHaveBeenCalled()
    })
})