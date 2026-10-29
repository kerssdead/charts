import RenderItemLine from '@/types/RenderItemLine'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

const getBounds = (stops: { x: number, y: number }[], areaBaseline: number | null = null) => {
    const shape = new RenderItemLine()

    shape.absolute = stops
    shape.width = 2
    shape.areaBaseline = areaBaseline
    shape.adjust(WINDOW)

    return shape.getBounds()
}

const STOPS = [{ x: 100, y: 200 }, { x: 300, y: 100 }, { x: 500, y: 200 }]

describe('Getting line bounds', () => {
    it('Should pad stops by half line width', () => {
        expect(getBounds(STOPS))
            .toEqual({ left: 9, top: 9, right: 51, bottom: 21 })
    })

    it('Should extend bounds down to area baseline', () => {
        expect(getBounds(STOPS, 400))
            .toEqual({ left: 9, top: 9, right: 51, bottom: 41 })
    })

    it('Should extend bounds up to area baseline above stops', () => {
        expect(getBounds(STOPS, 0))
            .toEqual({ left: 9, top: -1, right: 51, bottom: 21 })
    })

    it('Should return null without stops', () => {
        expect(getBounds([]))
            .toBeNull()
    })
})