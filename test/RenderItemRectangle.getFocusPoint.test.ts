import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

describe('Getting rectangle focus point and bounds', () => {
    const create = () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 1000, y: 2000, width: 500, height: 1000 }
        shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
        shape.adjust(new CanvasWindow(500, 500))

        return shape
    }

    it('Should be the center of the bounds', () => {
        expect(create().getFocusPoint())
            .toEqual({ x: 125, y: 250 })
    })

    it('Should use the bounds for the ring', () => {
        expect(create().getFocusBounds())
            .toEqual({ left: 100, top: 200, right: 150, bottom: 300 })
    })
})