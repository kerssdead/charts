import { bitmaps, pixels } from './RenderItemFieldCanvasMock'
import { cellsData, cellsItem, RED, render, WINDOW } from './RenderItemCellsTestData'
import { getPackedAlpha } from '@/helpers/PackedColor'

jest.mock('@/helpers/Canvas', () => jest.requireActual('./RenderItemFieldCanvasMock').canvasModule())

const item = () => {
    const shape = cellsItem(cellsData([RED, RED, 0]))

    shape.adjust(WINDOW)

    return shape
}

describe('Animating hover of cells', () => {
    beforeEach(() => {
        bitmaps.length = 0
    })

    it('Should animate while the pointer is over a cell', () => {
        expect(item().animateHover({ x: 210, y: 420 }, 0))
            .toBe(true)
    })

    it('Should not animate over a place without a cell', () => {
        expect(item().animateHover({ x: 290, y: 420 }, 0))
            .toBe(false)
    })

    it('Should not animate without the pointer', () => {
        expect(item().animateHover(null, 0))
            .toBe(false)
    })

    it('Should dim only the cell under the pointer', () => {
        const shape = item()

        shape.animateHover({ x: 210, y: 420 }, 0, true)
        render(shape)

        expect([...pixels()].map(getPackedAlpha))
            .toEqual([128, 255, 0])
    })
})