import { offscreenLayer } from '@/helpers/Canvas'

class FakeCanvas {
    style = {}

    setAttribute() {}

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

const load = () => {
    let canvas!: typeof import('@/helpers/Canvas')

    jest.isolateModules(() => {
        canvas = require('@/helpers/Canvas')
    })

    return canvas.offscreenLayer
}

const layerCanvas = (layer: CanvasRenderingContext2D) => layer.canvas as unknown as FakeCanvas

describe('Getting offscreen layer', () => {
    it('Should size layer to the requested area', () => {
        const canvas = layerCanvas(load()(200, 100))

        expect([canvas.width, canvas.height])
            .toEqual([200, 100])
    })

    it('Should share one layer between requests', () => {
        const offscreenLayer = load()

        expect(offscreenLayer(200, 100))
            .toBe(offscreenLayer(50, 300))
    })

    it('Should grow layer to fit a larger area', () => {
        const offscreenLayer = load()

        offscreenLayer(200, 100)

        const canvas = layerCanvas(offscreenLayer(300, 50))

        expect([canvas.width, canvas.height])
            .toEqual([300, 100])
    })

    it('Should not resize layer for a smaller area', () => {
        const offscreenLayer = load()
        const canvas = layerCanvas(offscreenLayer(200, 100))
        const resizes = canvas.resizes

        offscreenLayer(150, 80)

        expect(canvas.resizes)
            .toBe(resizes)
    })
})