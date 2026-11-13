import RenderItemLine from '@/types/RenderItemLine'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'

const WINDOW = new CanvasWindow(500, 500)

const STOPS = [{ x: 100, y: 100 }, { x: 300, y: 100 }]

const createLine = (areaBaseline: number | null) => {
    const shape = new RenderItemLine()

    shape.absolute = STOPS
    shape.area.baseline = areaBaseline

    return shape
}

const getBottomAt = (previous: RenderItemLine, next: RenderItemLine, morph: number) => {
    next.morphFrom(previous, 1)
    next.adjust(WINDOW, morph)

    return next.getBounds()?.bottom
}

const CLIP = { x: 100, y: 200, width: 1000, height: 2000 }

const getClipRectAt = (from: typeof CLIP | null, to: typeof CLIP, morph: number) => {
    const previous = createLine(null)
    const next = createLine(null)
    const ctx = {
        lineWidth: 1,
        setLineDash: jest.fn(),
        save: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        restore: jest.fn()
    }

    previous.clip = from
    next.clip = to

    next.morphFrom(previous, 1)
    next.adjust(WINDOW, morph)
    next.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(next))

    return ctx.rect.mock.calls[0]
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

    it('Should move clip box from previous clip box', () => {
        expect(getClipRectAt({ x: 300, y: 400, width: 3000, height: 4000 }, CLIP, .5))
            .toEqual([20, 30, 200, 300])
    })

    it('Should keep clip box when previous line has none', () => {
        expect(getClipRectAt(null, CLIP, .5))
            .toEqual([10, 20, 100, 200])
    })
})