import RenderItemLine from '@/types/RenderItemLine'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

const STOPS = [{ x: 100, y: 100 }, { x: 300, y: 100 }]

const createLine = (areaBaseline: number | null) => {
    const shape = new RenderItemLine()

    shape.absolute = STOPS
    shape.areaBaseline = areaBaseline

    return shape
}

const getBottomAt = (previous: RenderItemLine, next: RenderItemLine, morph: number) => {
    next.morphFrom(previous, 1)
    next.adjust(WINDOW, morph)

    return next.getBounds()!.bottom
}

describe('Morphing line from previous shape', () => {
    it('Should move area baseline from previous area', () => {
        expect(getBottomAt(createLine(400), createLine(200), .5))
            .toBe(30.5)
    })

    it('Should end area baseline on its own position', () => {
        expect(getBottomAt(createLine(400), createLine(200), 1))
            .toBe(20.5)
    })

    it('Should keep area baseline when previous line has no area', () => {
        expect(getBottomAt(createLine(null), createLine(200), .5))
            .toBe(20.5)
    })

    it('Should not morph from other shapes', () => {
        expect(createLine(200).morphFrom(new RenderItemRectangle(), 1))
            .toBe(false)
    })
})