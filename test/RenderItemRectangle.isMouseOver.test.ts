import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

const rect = (radius?: number) => {
    const shape = new RenderItemRectangle()

    shape.absolute = { x: 1000, y: 1000, width: 2000, height: 2000 }

    if (radius !== undefined)
        shape.clip = { x: 1000, y: 1000, width: 2000, height: 2000, radius }

    shape.adjust(WINDOW)

    return shape
}

describe('Checking whether pointer is over rectangle', () => {
    it('Should be over a point inside the bounds', () => {
        expect(rect().isMouseOver({ x: 200, y: 200 }))
            .toBe(true)
    })

    it('Should not be over a point outside the bounds', () => {
        expect(rect().isMouseOver({ x: 400, y: 200 }))
            .toBe(false)
    })

    it('Should be over a point inside the rounded clip', () => {
        expect(rect(1000).isMouseOver({ x: 200, y: 200 }))
            .toBe(true)
    })

    it('Should not be over a point cut off by the rounded clip', () => {
        expect(rect(1000).isMouseOver({ x: 101, y: 101 }))
            .toBe(false)
    })
})
