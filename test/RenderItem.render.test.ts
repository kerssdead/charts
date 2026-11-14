import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import Panel from '@/types/Panel'
import { HorizontalAlignment, LineJoin, VerticalAlignment } from '@/static/Enums'

const context = () => ({
    globalAlpha: 1,
    lineWidth: 1,
    lineJoin: LineJoin.Miter as LineJoin,
    fillStyle: '',
    strokeStyle: '',
    beginPath: jest.fn(),
    setLineDash: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    restore: jest.fn()
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

    it('Should reset line join left by previous item', () => {
        const ctx = context()

        ctx.lineJoin = LineJoin.Round

        item(0).render(ctx as unknown as CanvasRenderingContext2D, WINDOW, new CanvasWindow(100, 100), 0)

        expect(ctx.lineJoin)
            .toBe(LineJoin.Miter)
    })

    it('Should skip ghosts that are not morphing', () => {
        const target = item(0)

        target.isGhost = true

        const ctx = render(target, new CanvasWindow(100, 100))

        expect(ctx.beginPath)
            .not.toHaveBeenCalled()
    })

    it('Should mark leaving items as temp after their frame', () => {
        const target = item(0)
        const ctx = context()

        target.animation.startInit(100, true)
        target.render(ctx as unknown as CanvasRenderingContext2D, WINDOW, new CanvasWindow(100, 100), 0)
        target.render(ctx as unknown as CanvasRenderingContext2D, WINDOW, new CanvasWindow(100, 100), 1000)

        expect(target.isTemp)
            .toBe(true)
    })

    it('Should fill with the item color and stroke with its stroke', () => {
        const target = item(0)

        target.color = '#ff0000'
        target.stroke = '#00ff00'

        const ctx = render(target, new CanvasWindow(100, 100))

        expect(ctx.fillStyle)
            .toBe('#ff0000')
        expect(ctx.strokeStyle)
            .toBe('#00ff00')
    })

    it('Should stroke with the fill color when no stroke is set', () => {
        const target = item(0)

        target.color = '#0000ff'

        const ctx = render(target, new CanvasWindow(100, 100))

        expect(ctx.strokeStyle)
            .toBe('#0000ff')
    })

    it('Should clip items that cross the scroll panel bounds', () => {
        const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })
        const target = item(0)

        panel.scroll = { top: 0, height: 100 }
        panel.baseHeight = 50
        panel.window = new CanvasWindow(100, 100)
        panel.clip = { x: 0, y: 0, width: 100, height: 100 }

        target.panel = panel
        target.isScrollable = true

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, WINDOW, new CanvasWindow(100, 100), 0)

        expect(ctx.save)
            .toHaveBeenCalled()
        expect(ctx.clip)
            .toHaveBeenCalled()
        expect(ctx.restore)
            .toHaveBeenCalled()
    })
})