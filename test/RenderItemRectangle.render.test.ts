import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

const WINDOW = new CanvasWindow(500, 500)

const context = () => ({
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
})

const render = (height: number, isGradient: boolean = true) => {
    const ctx = context()
    const shape = new RenderItemRectangle()
    const item = new RenderItem(shape)

    item.color = '#336699'
    shape.isFill = true
    shape.isGradient = isGradient
    shape.absolute = { x: 1000, y: 2000, width: 500, height }
    shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
    shape.adjust(WINDOW)
    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return ctx
}

describe('Rendering rectangle', () => {
    it('Should map unit gradient onto rectangle height', () => {
        const ctx = render(1000)

        expect([ctx.translate.mock.calls[0], ctx.scale.mock.calls[0], ctx.lineWidth])
            .toEqual([[0, 200], [100, 100], .01])
    })

    it('Should map unit gradient from top edge for negative height', () => {
        const ctx = render(-1000)

        expect([ctx.translate.mock.calls[0], ctx.scale.mock.calls[0]])
            .toEqual([[0, 100], [100, 100]])
    })

    it('Should reuse gradient between frames', () => {
        const ctx = context()
        const shape = new RenderItemRectangle()
        const item = new RenderItem(shape)

        item.color = '#123456'
        shape.isGradient = true

        for (const height of [1000, 500, 250]) {
            shape.absolute = { x: 1000, y: 2000, width: 500, height }
            shape.adjust(WINDOW)
            shape.render(ctx as unknown as CanvasRenderingContext2D, item)
        }

        expect(ctx.createLinearGradient)
            .toHaveBeenCalledTimes(1)
    })

    it('Should grow height from origin while initializing', () => {
        const ctx = context()
        const shape = new RenderItemRectangle()
        const item = new RenderItem(shape)

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
        shape.growAxis = 'y'
        shape.growOrigin = 3000
        item.animation.init = .5
        shape.adjust(WINDOW)
        shape.render(ctx as unknown as CanvasRenderingContext2D, item)

        expect(ctx.roundRect.mock.calls[0].slice(0, 4))
            .toEqual([100, 250, 50, 50])
    })

    it('Should grow width from origin while initializing', () => {
        const ctx = context()
        const shape = new RenderItemRectangle()
        const item = new RenderItem(shape)

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
        shape.growAxis = 'x'
        shape.growOrigin = 0
        item.animation.init = .5
        shape.adjust(WINDOW)
        shape.render(ctx as unknown as CanvasRenderingContext2D, item)

        expect(ctx.roundRect.mock.calls[0].slice(0, 4))
            .toEqual([50, 200, 25, 100])
    })

    it('Should restore context after gradient fill', () => {
        const ctx = render(1000)

        expect([ctx.save.mock.calls.length, ctx.restore.mock.calls.length])
            .toEqual([1, 1])
    })

    it('Should not transform context without gradient', () => {
        const ctx = render(1000, false)

        expect([ctx.save.mock.calls.length, ctx.translate.mock.calls.length, ctx.lineWidth])
            .toEqual([0, 0, 1])
    })
})