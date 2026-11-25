import CellLabelsLayer from '@/helpers/CellLabelsLayer'
import { getPackedAlpha } from '@/helpers/PackedColor'
import { bitmaps, pixels } from './RenderItemFieldCanvasMock'
import { BLUE, cellsData, cellsItem, RED, render, WINDOW } from './RenderItemCellsTestData'

jest.mock('@/helpers/Canvas', () => jest.requireActual('./RenderItemFieldCanvasMock').canvasModule())

jest.mock('@/helpers/CellLabelsLayer')

const labelsRender = () => (CellLabelsLayer as jest.Mock).mock.instances[0].render as jest.Mock

const adjusted = (shape = cellsItem()) => {
    shape.adjust(WINDOW)

    return shape
}

const alphas = () => [...pixels()].map(getPackedAlpha)

describe('Rendering cells', () => {
    beforeEach(() => {
        bitmaps.length = 0
        jest.clearAllMocks()
    })

    it('Should draw one pixel for every cell over the whole box', () => {
        const cells = cellsData([RED, BLUE, RED, BLUE, RED, BLUE], { columns: 3, rows: 2 })
        const ctx = render(adjusted(cellsItem(cells)))

        expect([bitmaps[0].canvas.width, bitmaps[0].canvas.height])
            .toEqual([3, 2])
        expect(ctx.drawImage)
            .toHaveBeenCalledWith(bitmaps[0].canvas, 200, 400, 100, 50)
    })

    it('Should paint every cell in its color', () => {
        render(adjusted())

        expect([...pixels()])
            .toEqual([RED, BLUE])
    })

    it('Should keep cell edges sharp and restore smoothing after', () => {
        const ctx = render(adjusted())

        expect(ctx.smoothingWhileDrawing)
            .toEqual([false])
        expect(ctx.imageSmoothingEnabled)
            .toBe(true)
    })

    it('Should draw nothing without cells', () => {
        expect(render(adjusted(cellsItem(null))).drawImage)
            .not.toHaveBeenCalled()
    })

    it('Should draw nothing for an empty box', () => {
        const shape = cellsItem()

        shape.box = { x: 0, y: 0, width: 0, height: 0 }

        expect(render(adjusted(shape)).drawImage)
            .not.toHaveBeenCalled()
    })

    it('Should hide every cell at the start', () => {
        render(adjusted(), 0)

        expect(alphas())
            .toEqual([0, 0])
    })

    it('Should reveal cells in the order of their delays', () => {
        render(adjusted(cellsItem(cellsData([RED, RED], { delays: Float32Array.of(0, 1) }))), .3)

        const [first, last] = alphas()

        expect(first)
            .toBeGreaterThan(0)
        expect(last)
            .toBe(0)
    })

    it('Should reveal the last cell by the end', () => {
        render(adjusted(cellsItem(cellsData([RED, RED], { delays: Float32Array.of(0, 1) }))), .999)

        expect(alphas()[1])
            .toBeGreaterThan(250)
    })

    it('Should paint the bitmap only when something changes', () => {
        const shape = adjusted()

        render(shape, .5)
        render(shape, .5)
        render(shape, 1)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(2)
    })

    it('Should pass the labels and their reveal to the label layer', () => {
        const shape = adjusted(cellsItem(cellsData([RED, RED], { delays: Float32Array.of(0, 1) })))

        render(shape, .3)

        const [, cells, frame] = labelsRender().mock.calls[0]

        expect(cells)
            .toBe(shape.cells)
        expect(frame.box)
            .toEqual({ x: 200, y: 400, width: 100, height: 50 })
        expect(frame.getAlpha(0))
            .toBeGreaterThan(0)
        expect(frame.getAlpha(1))
            .toBe(0)
    })

    it('Should tell the label layer to write the labels again only while they change', () => {
        const shape = adjusted()

        render(shape, .5)
        render(shape, 1)

        expect(labelsRender().mock.calls.map(call => call[2].isChanging))
            .toEqual([true, false])
    })

    it('Should tell the label layer to write the labels again while morphing', () => {
        const shape = cellsItem()

        shape.morphFrom(cellsItem(), 1)
        shape.adjust(WINDOW, .5)
        render(shape)

        expect(labelsRender().mock.calls[0][2].isChanging)
            .toBe(true)
    })
})