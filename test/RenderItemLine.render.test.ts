import RenderItemLine from '@/types/RenderItemLine'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'

const mockLayer: { current: unknown } = { current: null }

jest.mock('@/helpers/Canvas', () => ({
    ...jest.requireActual('@/helpers/Canvas'),
    offscreenLayer: () => mockLayer.current
}))

const WINDOW = new CanvasWindow(500, 500)

const context = (ratio: number = 1) => ({
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    setLineDash: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn(),
    getTransform: () => ({ a: ratio }),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn()
})

const layerContext = () => {
    const layer = {
        canvas: {},
        fillStyle: null as unknown,
        globalCompositeOperation: 'source-over',
        maskOperations: [] as string[],
        setTransform: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
    }

    layer.fillRect.mockImplementation(() => layer.maskOperations.push(layer.globalCompositeOperation))

    return layer
}

const render = (stops: { x: number, y: number }[], progress: number) => {
    const ctx = context()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    shape.canvas = stops
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return ctx
}

const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 10 }]

const AREA_STOPS = [{ x: 100, y: 200 }, { x: 300, y: 100 }, { x: 500, y: 200 }]

const renderArea = (
    stops: { x: number, y: number }[],
    areaBaseline: number | null,
    progress: number = 1,
    ratio: number = 1
) => {
    const ctx = context(ratio)
    const layer = layerContext()
    const shape = new RenderItemLine()
    const item = new RenderItem(shape)

    mockLayer.current = layer

    shape.absolute = stops
    shape.areaBaseline = areaBaseline
    shape.adjust(WINDOW)

    item.color = '#ff0000'
    item.animation.init = progress

    shape.render(ctx as unknown as CanvasRenderingContext2D, item)

    return { ctx, layer }
}

describe('Rendering line', () => {
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

    it('Should fade area from half transparent color to transparent', () => {
        const { layer } = renderArea(AREA_STOPS, 400)
        const gradient = layer.createLinearGradient.mock.results[0].value

        expect([layer.createLinearGradient.mock.calls[0], gradient.addColorStop.mock.calls])
            .toEqual([[0, 9.5, 0, 40.5], [[0, '#ff000080'], [1, '#ff000000']]])
    })

    it('Should mask area edges with edge fade', () => {
        const { layer } = renderArea(AREA_STOPS, 400)

        expect([
            layer.createLinearGradient.mock.calls[1],
            layer.fillRect.mock.calls,
            layer.maskOperations,
            layer.globalCompositeOperation
        ])
            .toEqual([[10, 0, 50, 0], [[10, 9.5, 40, 31]], ['destination-in'], 'source-over'])
    })

    it('Should copy area at device pixel ratio', () => {
        const { ctx, layer } = renderArea(AREA_STOPS, 400, 1, 2)

        expect([layer.setTransform.mock.calls, ctx.drawImage.mock.calls])
            .toEqual([
                [[1, 0, 0, 1, 0, 0], [2, 0, 0, 2, -20, -19]],
                [[layer.canvas, 0, 0, 80, 62, 10, 9.5, 40, 31]]
            ])
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

    it('Should skip fill for area without width', () => {
        const { ctx } = renderArea([{ x: 100, y: 200 }, { x: 100, y: 100 }], 400)

        expect(ctx.drawImage)
            .not.toHaveBeenCalled()
    })
})