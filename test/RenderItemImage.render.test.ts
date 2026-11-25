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

    it('Should draw a loaded image over the whole box', () => {
        (getImage as jest.Mock).mockReturnValue({ naturalWidth: 10, naturalHeight: 20 })

        const item = image()
        const ctx = context()

        item.box = { x: 1000, y: 2000, width: 500, height: 250 }
        item.adjust(WINDOW)
        item.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.drawImage)
            .toHaveBeenCalledWith({ naturalWidth: 10, naturalHeight: 20 }, 200, 400, 100, 50)
        expect(ctx.clip)
            .not.toHaveBeenCalled()
    })

    it('Should draw nothing for a box while the image is not loaded', () => {
        (getImage as jest.Mock).mockReturnValue(null)

        const item = image()
        const ctx = context()

        item.box = { x: 1000, y: 2000, width: 500, height: 250 }
        item.adjust(WINDOW)
        item.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.drawImage)
            .not.toHaveBeenCalled()
        expect(ctx.arc)
            .not.toHaveBeenCalled()
        expect(ctx.fill)
            .not.toHaveBeenCalled()
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