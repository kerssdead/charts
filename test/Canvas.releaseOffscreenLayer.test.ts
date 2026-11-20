const load = () => {
    let canvas!: typeof import('@/helpers/Canvas')

    jest.isolateModules(() => {
        canvas = require('@/helpers/Canvas')
    })

    return canvas
}

const fakeCanvas = () => ({
    width: 0,
    height: 0,
    style: {},
    setAttribute() {},
    getContext() {
        return { canvas: this }
    }
})

beforeEach(() => {
    (globalThis as unknown as { document: unknown }).document = { createElement: fakeCanvas }
})

afterEach(() => {
    delete (globalThis as Record<string, unknown>).document
})

describe('Releasing offscreen layer', () => {
    it('Should free layer pixels', () => {
        const { offscreenLayer, releaseOffscreenLayer } = load()
        const { canvas } = offscreenLayer(200, 100)

        releaseOffscreenLayer()

        expect([canvas.width, canvas.height])
            .toEqual([0, 0])
    })

    it('Should grow the released layer again on the next request', () => {
        const { offscreenLayer, releaseOffscreenLayer } = load()

        offscreenLayer(200, 100)
        releaseOffscreenLayer()

        const { canvas } = offscreenLayer(150, 80)

        expect([canvas.width, canvas.height])
            .toEqual([150, 80])
    })

    it('Should do nothing before any layer exists', () => {
        const { releaseOffscreenLayer } = load()

        expect(() => releaseOffscreenLayer())
            .not.toThrow()
    })
})