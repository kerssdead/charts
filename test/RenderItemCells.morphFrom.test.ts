import { bitmaps, pixels } from './RenderItemFieldCanvasMock'
import { BLUE, cellsData, cellsItem, RED, render, WINDOW } from './RenderItemCellsTestData'
import RenderItemImage from '@/types/RenderItemImage'
import { blendPacked } from '@/helpers/PackedColor'

jest.mock('@/helpers/Canvas', () => jest.requireActual('./RenderItemFieldCanvasMock').canvasModule())

const painted = (shape: ReturnType<typeof cellsItem>, morph: number) => {
    shape.adjust(WINDOW, morph)
    render(shape)

    return [...pixels(bitmaps.length - 1)]
}

describe('Morphing cells from previous', () => {
    beforeEach(() => {
        bitmaps.length = 0
    })

    it('Should morph from other cells', () => {
        expect(cellsItem().morphFrom(cellsItem(), 1))
            .toBe(true)
    })

    it('Should not morph from another kind of shape', () => {
        expect(cellsItem().morphFrom(new RenderItemImage('a.png'), 1))
            .toBe(false)
    })

    it('Should not morph from cells without data', () => {
        expect(cellsItem().morphFrom(cellsItem(null), 1))
            .toBe(false)
    })

    it('Should not morph without data of its own', () => {
        expect(cellsItem(null).morphFrom(cellsItem(), 1))
            .toBe(false)
    })

    it('Should blend every cell from its previous color', () => {
        const shape = cellsItem(cellsData([BLUE, RED]))

        shape.morphFrom(cellsItem(cellsData([RED, BLUE])), 1)

        expect(painted(shape, .5))
            .toEqual([blendPacked(RED, BLUE, .5), blendPacked(BLUE, RED, .5)])
    })

    it('Should take the previous color at the same place when the grid changes', () => {
        const shape = cellsItem(cellsData([BLUE, BLUE, BLUE, BLUE]))

        shape.morphFrom(cellsItem(cellsData([RED, BLUE])), 1)

        expect(painted(shape, 0))
            .toEqual([RED, RED, BLUE, BLUE])
    })

    it('Should continue from where the previous morph was', () => {
        const middle = cellsItem(cellsData([BLUE]))

        middle.morphFrom(cellsItem(cellsData([RED])), 1)

        const shape = cellsItem(cellsData([BLUE]))

        shape.morphFrom(middle, .5)

        expect(painted(shape, 0))
            .toEqual([blendPacked(RED, BLUE, .5)])
    })

    it('Should end with its own colors', () => {
        const shape = cellsItem(cellsData([BLUE]))

        shape.morphFrom(cellsItem(cellsData([RED])), 1)

        expect(painted(shape, 1))
            .toEqual([BLUE])
    })
})