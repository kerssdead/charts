import RenderItemImage from '@/types/RenderItemImage'
import CanvasWindow from '@/types/CanvasWindow'
import { ImageCrossOrigin } from '@/static/Enums'

jest.mock('@/helpers/Images', () => ({
    getImage: jest.fn()
}))

import { getImage } from '@/helpers/Images'

const WINDOW = new CanvasWindow(1000, 1000)

const image = () => {
    const result = new RenderItemImage('chart.png')

    result.absolute = { x: 1000, y: 2000 }
    result.size = 500

    return result
}

describe('Getting current image position', () => {
    it('Should return the absolute position by default', () => {
        expect(image().current())
            .toEqual({ x: 1000, y: 2000 })
    })

    it('Should interpolate from the previous position while morphing', () => {
        const item = image()

        item.from = { x: 0, y: 0 }

        expect(item.current(.5))
            .toEqual({ x: 500, y: 1000 })
    })
})

describe('Morphing image', () => {
    it('Should take the previous position from another image', () => {
        const item = image()
        const previous = image()

        previous.absolute = { x: 100, y: 200 }

        expect(item.morphFrom(previous, 1))
            .toBe(true)
        expect(item.from)
            .toEqual({ x: 100, y: 200 })
    })

    it('Should not morph from a different shape', () => {
        const item = image()

        expect(item.morphFrom({} as never, 1))
            .toBe(false)
    })
})

describe('Adjusting image to the window', () => {
    it('Should map the position and size to pixels', () => {
        const item = image()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 150, top: 350, right: 250, bottom: 450 })
    })
})

describe('Rendering image', () => {
    it('Should fill the circle when the image is not loaded', () => {
        (getImage as jest.Mock).mockReturnValue(null)

        const item = image()
        const ctx = { arc: jest.fn(), fill: jest.fn(), save: jest.fn(), clip: jest.fn(), drawImage: jest.fn(), restore: jest.fn() }

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
        const ctx = { arc: jest.fn(), fill: jest.fn(), save: jest.fn(), clip: jest.fn(), drawImage: jest.fn(), restore: jest.fn() }

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
})

describe('Checking image hover', () => {
    it('Should hit points inside the circle', () => {
        const item = image()

        item.adjust(WINDOW)

        expect(item.isMouseOver({ x: 200, y: 400 }))
            .toBe(true)
        expect(item.isMouseOver({ x: 300, y: 400 }))
            .toBe(false)
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
