import RenderItemLine from '@/types/RenderItemLine'
import CanvasWindow from '@/types/CanvasWindow'
import LinePathTracer from '@/render/LinePathTracer'
import { LineDrawMode } from '@/static/Enums'

const WINDOW = new CanvasWindow(500, 500)

const curveEnds = (shape: RenderItemLine) => {
    const ctx = { moveTo: jest.fn(), lineTo: jest.fn(), bezierCurveTo: jest.fn() }

    shape.pathTracer.trace(ctx as unknown as CanvasRenderingContext2D, shape.canvas, shape.canvas.length, false)

    return ctx.bezierCurveTo.mock.calls.map(call => ({ x: call[4], y: call[5] }))
}

const smoothLine = () => {
    const shape = new RenderItemLine()

    shape.pathTracer = new LinePathTracer(LineDrawMode.Smooth)
    shape.absolute = [{ x: 0, y: 0 }, { x: 1000, y: 2000 }, { x: 2000, y: 1000 }]

    return shape
}

describe('Adjusting line to window', () => {
    it('Should build smooth curve through canvas stops', () => {
        const shape = smoothLine()

        shape.adjust(WINDOW)

        expect(curveEnds(shape))
            .toEqual(shape.canvas.slice(1))
    })

    it('Should follow morphing stops with smooth curve', () => {
        const shape = smoothLine()

        shape.from = shape.absolute.map(stop => ({ x: stop.x, y: 0 }))
        shape.adjust(WINDOW, 0.5)

        const middle = curveEnds(shape)

        shape.adjust(WINDOW, 1)

        expect([middle[0].y === curveEnds(shape)[0].y, curveEnds(shape)])
            .toEqual([false, shape.canvas.slice(1)])
    })
})