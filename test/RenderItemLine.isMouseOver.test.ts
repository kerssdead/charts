import RenderItemLine from '@/types/RenderItemLine'
import CanvasWindow from '@/types/CanvasWindow'
import RectangleDimensions from '@/types/RectangleDimensions'

const WINDOW = new CanvasWindow(500, 500)

const createLine = (clip: RectangleDimensions | null = null) => {
    const shape = new RenderItemLine()

    shape.absolute = [{ x: 1000, y: 500 }, { x: 2000, y: 2000 }]
    shape.width = 2
    shape.clip = clip
    shape.adjust(WINDOW)

    return shape
}

describe('Checking whether pointer is over line', () => {
    it('Should be over a stop near the pointer', () => {
        expect(createLine().isMouseOver({ x: 102, y: 51 }))
            .toBe(true)
    })

    it('Should not be over a line far from its stops', () => {
        expect(createLine().isMouseOver({ x: 150, y: 120 }))
            .toBe(false)
    })

    it('Should not be over a stop outside the clip box', () => {
        const line = createLine({ x: 0, y: 1000, width: 5000, height: 4000 })

        expect([line.isMouseOver({ x: 100, y: 50 }), line.isMouseOver({ x: 200, y: 200 })])
            .toEqual([false, true])
    })
})