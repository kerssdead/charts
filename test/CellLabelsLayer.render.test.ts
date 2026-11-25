import CellLabelsLayer, { LabelAlpha } from '@/helpers/CellLabelsLayer'
import CellsRenderData from '@/types/CellsRenderData'

type Layer = { width: number, height: number }

type LayerContext = {
    setTransform: jest.Mock
    fillText: jest.Mock
    font: string
    globalAlpha: number
    fillStyle: string
    fills: { text: string, x: number, y: number, alpha: number, color: string }[]
}

const layers: { canvas: Layer, ctx: LayerContext }[] = []

jest.mock('@/helpers/Canvas', () => ({
    createCanvas: () => {
        const canvas = { width: 0, height: 0 }
        const ctx: LayerContext = {
            setTransform: jest.fn(),
            font: '',
            globalAlpha: 1,
            fillStyle: '',
            fills: [],
            fillText: jest.fn((text: string, x: number, y: number) => {
                ctx.fills.push({ text, x, y, alpha: ctx.globalAlpha, color: ctx.fillStyle })
            })
        }

        layers.push({ canvas, ctx })

        return canvas
    },
    getContext: (canvas: Layer) => layers.find(layer => layer.canvas === canvas)?.ctx
}))

const cells = (labels: CellsRenderData['labels']): CellsRenderData => ({
    columns: 2,
    rows: 1,
    colors: new Uint32Array(2),
    delays: new Float32Array(2),
    labels,
    labelSize: 10
})

const TWO = cells([{ text: 'a', color: '#000000' }, { text: 'b', color: '#ffffff' }])

const BOX = { x: 10, y: 20, width: 200, height: 100 }

const target = (ratio = 1) => ({ getTransform: () => ({ a: ratio }), drawImage: jest.fn() })

const render = (
    layer: CellLabelsLayer,
    data = TWO,
    { ctx = target(), getAlpha = (() => 1) as LabelAlpha, isChanging = false, box = BOX } = {}
) => {
    layer.render(ctx as unknown as CanvasRenderingContext2D, data, { box, getAlpha, isChanging })

    return ctx
}

describe('Rendering cell labels', () => {
    beforeEach(() => {
        layers.length = 0
    })

    it('Should write every label in the middle of its cell', () => {
        render(new CellLabelsLayer())

        expect(layers[0].ctx.fills.map(({ text, x, y }) => [text, x, y]))
            .toEqual([['a', 60, 73], ['b', 160, 73]])
    })

    it('Should write every label in its own color', () => {
        render(new CellLabelsLayer())

        expect(layers[0].ctx.fills.map(fill => fill.color))
            .toEqual(['#000000', '#ffffff'])
    })

    it('Should write labels in the label size', () => {
        render(new CellLabelsLayer())

        expect(layers[0].ctx.font)
            .toMatch(/^10px /)
    })

    it('Should skip cells without a label', () => {
        render(new CellLabelsLayer(), cells([null, { text: 'b', color: '#ffffff' }]))

        expect(layers[0].ctx.fills.map(fill => fill.text))
            .toEqual(['b'])
    })

    it('Should fade every label by its own alpha', () => {
        render(new CellLabelsLayer(), TWO, { getAlpha: index => index === 0 ? .25 : 0 })

        expect(layers[0].ctx.fills.map(fill => [fill.text, fill.alpha]))
            .toEqual([['a', .25]])
    })

    it('Should draw nothing without labels', () => {
        const ctx = render(new CellLabelsLayer(), cells([]))

        expect(ctx.drawImage)
            .not.toHaveBeenCalled()
        expect(layers)
            .toHaveLength(0)
    })

    it('Should draw the layer over the box', () => {
        const ctx = render(new CellLabelsLayer())

        expect(ctx.drawImage)
            .toHaveBeenCalledWith(layers[0].canvas, 10, 20, 200, 100)
    })

    it('Should write labels at the pixel ratio of the canvas', () => {
        const ctx = render(new CellLabelsLayer(), TWO, { ctx: target(2) })

        expect([layers[0].canvas.width, layers[0].canvas.height])
            .toEqual([400, 200])
        expect(layers[0].ctx.setTransform)
            .toHaveBeenCalledWith(2, 0, 0, 2, -20, -40)
        expect(ctx.drawImage)
            .toHaveBeenCalledWith(layers[0].canvas, 10, 20, 200, 100)
    })

    it('Should align the layer to whole pixels', () => {
        const ctx = render(new CellLabelsLayer(), TWO, { box: { x: 10.5, y: 20.25, width: 200, height: 100 } })

        expect(ctx.drawImage)
            .toHaveBeenCalledWith(layers[0].canvas, 10, 20, 201, 101)
    })

    it('Should reuse the written labels while nothing changes', () => {
        const layer = new CellLabelsLayer()

        render(layer)
        render(layer)

        expect(layers[0].ctx.fillText)
            .toHaveBeenCalledTimes(2)
    })

    it('Should write the labels again while they change', () => {
        const layer = new CellLabelsLayer()

        render(layer, TWO, { isChanging: true })
        render(layer)

        expect(layers[0].ctx.fillText)
            .toHaveBeenCalledTimes(4)
    })

    it('Should write the labels again when the box moves', () => {
        const layer = new CellLabelsLayer()

        render(layer)
        render(layer, TWO, { box: { ...BOX, x: 30 } })

        expect(layers[0].ctx.fillText)
            .toHaveBeenCalledTimes(4)
    })
})