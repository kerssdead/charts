jest.mock('@/helpers/Images', () => ({
    getImage: jest.fn()
}))

import { getImage } from '@/helpers/Images'
import { ImageCrossOrigin } from '@/static/Enums'
import { context, image, WINDOW } from './RenderItemImageTestData'

describe('Rendering image', () => {
    it('Should fill the circle when the image is not loaded', () => {
        (getImage as jest.Mock).mockReturnValue(null)

        const item = image()
        const ctx = context()

        item.adjust(WINDOW)
        item.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.arc)
            .toHaveBeenCalledWith(200, 400, 50, 0, Math.PI * 2)
        expect(ctx.fill)
            .toHaveBeenCalledTimes(1)
        expect(ctx.drawImage)
            .not.toHaveBeenCalled()
    })

    it('Should clip and draw the loaded image', () => {
        (getImage as jest.Mock).mockReturnValue({ naturalWidth: 10, naturalHeight: 20 })

        const item = image()
        const ctx = context()

        item.adjust(WINDOW)
        item.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.save)
            .toHaveBeenCalled()
        expect(ctx.clip)
            .toHaveBeenCalled()
        expect(ctx.drawImage)
            .toHaveBeenCalled()
        expect(ctx.restore)
            .toHaveBeenCalled()
    })

    it('Should load images with the configured cross origin', () => {
        (getImage as jest.Mock).mockReturnValue(null)

        const item = image()

        item.crossOrigin = ImageCrossOrigin.Anonymous

        const ctx = { arc: jest.fn(), fill: jest.fn() }

        item.adjust(WINDOW)
        item.render(ctx as unknown as CanvasRenderingContext2D)

        expect(getImage)
            .toHaveBeenCalledWith('chart.png', ImageCrossOrigin.Anonymous)
    })
})