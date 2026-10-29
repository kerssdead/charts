import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

describe('Adjusting rectangle', () => {
    it('Should scale position, size and radii to window', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.radii = [100, 100, 0, 0]

        shape.adjust(WINDOW)

        expect(shape.canvas)
            .toEqual({ x: 100, y: 200, width: 50, height: 100, radii: [10, 10, 0, 0] })
    })

    it('Should reuse canvas objects between frames', () => {
        const shape = new RenderItemRectangle()
        const radii = shape.canvas.radii

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.adjust(WINDOW)

        const bounds = shape.getBounds()

        shape.adjust(WINDOW)

        expect([shape.canvas.radii === radii, shape.getBounds() === bounds])
            .toEqual([true, true])
    })

    it('Should not change radii of shape', () => {
        const shape = new RenderItemRectangle()

        shape.radii = [100, 100, 0, 0]
        shape.adjust(WINDOW)

        expect(shape.radii)
            .toEqual([100, 100, 0, 0])
    })
})