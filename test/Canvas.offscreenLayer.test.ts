import { offscreenLayer } from '@/helpers/Canvas'

class FakeCanvas {
    style = {}

    resizes = 0

    private size = { width: 0, height: 0 }

    get width() {
        return this.size.width
    }

    set width(width: number) {
        this.resizes++
        this.size.width = width
    }

    get height() {
        return this.size.height
    }

    set height(height: number) {
        this.resizes++
        this.size.height = height
    }

    getContext() {
        return { canvas: this }
    }
}

(globalThis as unknown as { document: unknown }).document = { createElement: () => new FakeCanvas() }

const chartContext = (width: number, height: number) =>
    ({ canvas: { width, height } }) as unknown as CanvasRenderingContext2D

const layerCanvas = (ctx: CanvasRenderingContext2D) => offscreenLayer(ctx).canvas as unknown as FakeCanvas

describe('Getting offscreen layer', () => {
    it('Should size layer to chart canvas', () => {
        const canvas = layerCanvas(chartContext(200, 100))

        expect([canvas.width, canvas.height])
            .toEqual([200, 100])
    })

    it('Should reuse layer for the same chart', () => {
        const ctx = chartContext(200, 100)

        expect(offscreenLayer(ctx))
            .toBe(offscreenLayer(ctx))
    })

    it('Should create separate layers for different charts', () => {
        expect(offscreenLayer(chartContext(200, 100)))
            .not.toBe(offscreenLayer(chartContext(200, 100)))
    })

    it('Should resize layer when chart canvas resizes', () => {
        const ctx = chartContext(200, 100)

        offscreenLayer(ctx)

        ctx.canvas.width = 300
        ctx.canvas.height = 150

        const canvas = layerCanvas(ctx)

        expect([canvas.width, canvas.height])
            .toEqual([300, 150])
    })

    it('Should not resize layer when chart size is unchanged', () => {
        const ctx = chartContext(200, 100)
        const canvas = layerCanvas(ctx)
        const resizes = canvas.resizes

        offscreenLayer(ctx)

        expect(canvas.resizes)
            .toBe(resizes)
    })
})