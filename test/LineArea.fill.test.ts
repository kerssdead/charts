import LineArea from '@/render/LineArea'
import { layerContext, WINDOW } from './RenderItemLineTestData'

const mockLayer: { current: unknown } = { current: null }

jest.mock('@/helpers/Canvas', () => ({
    ...jest.requireActual('@/helpers/Canvas'),
    offscreenLayer: () => mockLayer.current
}))

const BOUNDS = { left: 9.5, top: 9.5, right: 50.5, bottom: 40.5 }

const fill = (left: number, right: number, ratio: number = 1) => {
    const ctx = { getTransform: () => ({ a: ratio }), drawImage: jest.fn() }
    const layer = layerContext()
    const area = new LineArea()

    mockLayer.current = layer

    area.baseline = 400
    area.adjust(WINDOW, 1)
    area.fill(ctx as unknown as CanvasRenderingContext2D, '#ff0000', BOUNDS, { left, right, trace: jest.fn() })

    return { ctx, layer }
}

describe('Filling line area', () => {
    it('Should fade area from half transparent color to transparent', () => {
        const { layer } = fill(10, 50)
        const gradient = layer.createLinearGradient.mock.results[0].value

        expect([layer.createLinearGradient.mock.calls[0], gradient.addColorStop.mock.calls])
            .toEqual([[0, 9.5, 0, 40.5], [[0, '#ff000080'], [1, '#ff000000']]])
    })

    it('Should mask area edges with edge fade', () => {
        const { layer } = fill(10, 50)

        expect([
            layer.createLinearGradient.mock.calls[1],
            layer.fillRect.mock.calls,
            layer.maskOperations,
            layer.globalCompositeOperation
        ])
            .toEqual([[10, 0, 50, 0], [[10, 9.5, 40, 31]], ['destination-in'], 'source-over'])
    })

    it('Should copy area at device pixel ratio', () => {
        const { ctx, layer } = fill(10, 50, 2)

        expect([layer.setTransform.mock.calls, ctx.drawImage.mock.calls])
            .toEqual([
                [[1, 0, 0, 1, 0, 0], [2, 0, 0, 2, -20, -19]],
                [[layer.canvas, 0, 0, 80, 62, 10, 9.5, 40, 31]]
            ])
    })

    it('Should skip fill for area without width', () => {
        const { ctx } = fill(10, 10)

        expect(ctx.drawImage)
            .not.toHaveBeenCalled()
    })
})