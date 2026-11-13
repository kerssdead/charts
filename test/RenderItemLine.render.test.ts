import RenderItemLine from '@/types/RenderItemLine'
import RenderItem from '@/types/RenderItem'
import { LineDrawMode, LineJoin } from '@/static/Enums'
import LinePathTracer from '@/render/LinePathTracer'
import { AREA_STOPS, CLIP, context, layerContext, STOPS, WINDOW } from './RenderItemLineTestData'

const mockLayer: { current: unknown } = { current: null }

jest.mock('@/helpers/Canvas', () => ({
    ...jest.requireActual('@/helpers/Canvas'),
    offscreenLayer: () => mockLayer.current
}))

const render = (stops: { x: number, y: number }[], progress: number) => {
    const ctx = context()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    shape.canvas = stops
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return ctx
}

const renderArea = (stops: { x: number, y: number }[], areaBaseline: number | null, progress: number = 1) => {
    const ctx = context()
    const layer = layerContext()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    mockLayer.current = layer

    shape.absolute = stops
    shape.area.baseline = areaBaseline
    shape.adjust(WINDOW)

    item.color = '#ff0000'
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return { ctx, layer }
}

const renderSmooth = (areaBaseline: number | null, progress: number) => {
    const ctx = context()
    const layer = layerContext()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    mockLayer.current = layer

    shape.pathTracer = new LinePathTracer(LineDrawMode.Smooth)
    shape.absolute = AREA_STOPS
    shape.area.baseline = areaBaseline
    shape.adjust(WINDOW)

    item.color = '#ff0000'
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return { ctx, layer, shape }
}

const renderClipped = (stops: { x: number, y: number }[], clip: typeof CLIP | null) => {
    const ctx = context()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    shape.absolute = stops
    shape.clip = clip
    shape.adjust(WINDOW)

    item.animation.init = 1

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return ctx
}

describe('Rendering line', () => {
    it('Should draw smooth line with curves only', () => {
        const { ctx } = renderSmooth(null, 1)

        expect([ctx.bezierCurveTo.mock.calls.length, ctx.lineTo.mock.calls.length])
            .toEqual([2, 0])
    })

    it('Should end partial smooth line on partial stop', () => {
        const { ctx, shape } = renderSmooth(null, .75)
        const { partialStop } = shape.pathTracer

        expect(ctx.bezierCurveTo.mock.calls.at(-1)?.slice(4))
            .toEqual([partialStop.x, partialStop.y])
    })

    it('Should close smooth area under partial stop', () => {
        const { layer, shape } = renderSmooth(200, .75)
        const { partialStop } = shape.pathTracer

        expect([layer.bezierCurveTo.mock.calls.at(-1)?.slice(4), layer.lineTo.mock.calls[0][0]])
            .toEqual([[partialStop.x, partialStop.y], partialStop.x])
    })

    it('Should draw all stops when initialized', () => {
        const ctx = render(STOPS, 1)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[10, 0], [10, 10], [20, 10]]])
    })

    it('Should draw line up to progress length', () => {
        const ctx = render(STOPS, .5)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[10, 0], [10, 5]]])
    })

    it('Should end partial line on stop when progress reaches it', () => {
        const ctx = render(STOPS, 2 / 3)

        expect(ctx.lineTo.mock.calls)
            .toEqual([[10, 0], [10, 10], [10, 10]])
    })

    it('Should draw degenerate segment at zero progress', () => {
        const ctx = render(STOPS, 0)

        expect([ctx.moveTo.mock.calls, ctx.lineTo.mock.calls])
            .toEqual([[[0, 0]], [[0, 0]]])
    })

    it('Should draw point for single stop', () => {
        const ctx = render([{ x: 5, y: 5 }], 1)

        expect([ctx.arc.mock.calls.length, ctx.moveTo.mock.calls.length])
            .toEqual([1, 0])
    })

    it('Should not keep partial stops between frames', () => {
        const ctx = context()
        const shape = new RenderItemLine()
        const item = new RenderItem(shape)

        shape.canvas = STOPS

        for (const progress of [.5, 1]) {
            item.animation.init = progress
            shape.render(ctx as unknown as CanvasRenderingContext2D, item)
        }

        expect(ctx.lineTo.mock.calls.slice(2))
            .toEqual([[10, 0], [10, 10], [20, 10]])
    })

    it('Should fill area under line down to baseline', () => {
        const { layer } = renderArea(AREA_STOPS, 400)

        expect([layer.moveTo.mock.calls, layer.lineTo.mock.calls, layer.fill.mock.calls.length])
            .toEqual([[[10, 20]], [[30, 10], [50, 20], [50, 40], [10, 40]], 1])
    })

    it('Should fill area under drawn part during init', () => {
        const { layer } = renderArea(AREA_STOPS, 400, .25)

        expect(layer.lineTo.mock.calls)
            .toEqual([[20, 15], [20, 40], [10, 40]])
    })

    it('Should draw area before line', () => {
        const { ctx } = renderArea(AREA_STOPS, 400)

        expect(ctx.drawImage.mock.invocationCallOrder[0])
            .toBeLessThan(ctx.stroke.mock.invocationCallOrder[0])
    })

    it('Should clip line to area horizontal range', () => {
        const { ctx } = renderArea(AREA_STOPS, 400)
        const [save, clip, stroke, restore] = [ctx.save, ctx.clip, ctx.stroke, ctx.restore]
            .map(fn => fn.mock.invocationCallOrder[0])

        expect([ctx.rect.mock.calls, save < clip && clip < stroke && stroke < restore])
            .toEqual([[[10, 9.5, 40, 31]], true])
    })

    it('Should not fill or clip line without area', () => {
        const { ctx } = renderArea(AREA_STOPS, null)

        expect([ctx.drawImage.mock.calls.length, ctx.save.mock.calls.length, ctx.clip.mock.calls.length])
            .toEqual([0, 0, 0])
    })

    it('Should round joins so peaks do not overshoot stops', () => {
        expect((render(STOPS, 1) as unknown as CanvasRenderingContext2D).lineJoin)
            .toBe(LineJoin.Round)
    })

    it('Should clip stroke to clip box', () => {
        const ctx = renderClipped(AREA_STOPS, CLIP)
        const [save, clip, stroke, restore] = [ctx.save, ctx.clip, ctx.stroke, ctx.restore]
            .map(fn => fn.mock.invocationCallOrder[0])

        expect([ctx.rect.mock.calls, save < clip && clip < stroke && stroke < restore])
            .toEqual([[[10, 20, 100, 200]], true])
    })

    it('Should start new path after clipping', () => {
        const ctx = renderClipped(AREA_STOPS, CLIP)

        expect(ctx.beginPath.mock.invocationCallOrder[0])
            .toBeGreaterThan(ctx.clip.mock.invocationCallOrder[0])
    })

    it('Should clip point of single stop', () => {
        const ctx = renderClipped([{ x: 200, y: 300 }], CLIP)
        const [clip, arc, restore] = [ctx.clip, ctx.arc, ctx.restore]
            .map(fn => fn.mock.invocationCallOrder[0])

        expect(clip < arc && arc < restore)
            .toBe(true)
    })

    it('Should not clip without clip box', () => {
        const ctx = renderClipped(AREA_STOPS, null)

        expect([ctx.save.mock.calls.length, ctx.clip.mock.calls.length])
            .toEqual([0, 0])
    })

    it('Should skip gradient when item has no fill colour', () => {
        const ctx = { ...context(), createLinearGradient: jest.fn() }
        const shape = new RenderItemLine()

        shape.canvas = STOPS
        shape.isGradient = true

        shape.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(shape))

        expect(ctx.createLinearGradient)
            .not.toHaveBeenCalled()
    })

    it('Should skip area fill when item has no fill colour', () => {
        const layer = layerContext()
        const shape = new RenderItemLine()

        mockLayer.current = layer

        shape.absolute = AREA_STOPS
        shape.area.baseline = 400
        shape.adjust(WINDOW)

        shape.render(context() as unknown as CanvasRenderingContext2D, new RenderItem(shape))

        expect(layer.fill)
            .not.toHaveBeenCalled()
    })
})