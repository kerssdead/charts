import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

const WINDOW = new CanvasWindow(500, 500)

describe('Getting rectangle bounds', () => {
    it('Should apply alignment to bounds', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.align = { x: HorizontalAlignment.Center, y: VerticalAlignment.Bottom }
        shape.adjust(WINDOW)

        expect(shape.getBounds())
            .toEqual({ left: 75, top: 100, right: 125, bottom: 200 })
    })

    it('Should apply right and center alignment to bounds', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.align = { x: HorizontalAlignment.Right, y: VerticalAlignment.Center }
        shape.adjust(WINDOW)

        expect(shape.getBounds())
            .toEqual({ left: 50, top: 150, right: 100, bottom: 250 })
    })

    it('Should order edges for negative height', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 1000, y: 2000, width: 500, height: -1000 }
        shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
        shape.adjust(WINDOW)

        expect(shape.getBounds())
            .toEqual({ left: 100, top: 100, right: 150, bottom: 200 })
    })

    it('Should follow latest adjust', () => {
        const shape = new RenderItemRectangle()

        shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.adjust(WINDOW)

        shape.absolute = { x: 0, y: 0, width: 500, height: 1000 }
        shape.adjust(WINDOW)

        expect(shape.getBounds())
            .toEqual({ left: 0, top: 0, right: 50, bottom: 100 })
    })
})