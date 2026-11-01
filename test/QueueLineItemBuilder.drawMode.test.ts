import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import RenderItemLine from '@/types/RenderItemLine'
import { LineDrawMode } from '@/static/Enums'

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 10 }]

const buildLine = (configure: (line: QueueLineItemBuilder) => void) => {
    return QueueItemsBuilder.build(items => configure(items.line()))[0].shape as RenderItemLine
}

const curveCount = (line: RenderItemLine) => {
    const ctx = { moveTo: jest.fn(), lineTo: jest.fn(), bezierCurveTo: jest.fn() }

    line.pathTracer.updateCurve(STOPS)
    line.pathTracer.trace(ctx as unknown as CanvasRenderingContext2D, STOPS, STOPS.length, false)

    return ctx.bezierCurveTo.mock.calls.length
}

describe('Building line draw mode', () => {
    it('Should draw curves in smooth mode', () => {
        expect(curveCount(buildLine(line => line.drawMode(LineDrawMode.Smooth))))
            .toBe(1)
    })

    it('Should draw straight in straight mode', () => {
        expect(curveCount(buildLine(line => line.drawMode(LineDrawMode.Straight))))
            .toBe(0)
    })

    it('Should draw straight without a mode', () => {
        expect(curveCount(buildLine(line => line.drawMode(undefined))))
            .toBe(0)
    })

    it('Should draw straight by default', () => {
        expect(curveCount(buildLine(() => {})))
            .toBe(0)
    })
})