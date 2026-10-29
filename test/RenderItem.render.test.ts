import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

const context = () => ({
    globalAlpha: 1,
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    beginPath: jest.fn(),
    setLineDash: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn()
})

const item = (x: number) => {
    const shape = new RenderItemRectangle()
    const result = new RenderItem(shape)

    shape.absolute = { x, y: 0, width: 100, height: 100 }
    shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }

    return result
}

const WINDOW = new CanvasWindow(1000, 100)

const render = (target: RenderItem, screen: CanvasWindow) => {
    const ctx = context()

    target.render(ctx as unknown as CanvasRenderingContext2D, WINDOW, screen, 0)

    return ctx
}

describe('Rendering item', () => {
    it('Should skip item outside of screen', () => {
        const ctx = render(item(4000), new CanvasWindow(100, 100))

        expect(ctx.stroke)
            .not.toHaveBeenCalled()
    })

    it('Should use current screen size for culling', () => {
        const target = item(4000)

        render(target, new CanvasWindow(100, 100))

        const ctx = render(target, new CanvasWindow(1000, 100))

        expect(ctx.stroke)
            .toHaveBeenCalled()
    })

    it('Should reset line dash to solid line', () => {
        const ctx = render(item(0), new CanvasWindow(1000, 100))

        expect(ctx.setLineDash)
            .toHaveBeenCalledWith([])
    })
})