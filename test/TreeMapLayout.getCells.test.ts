import { getCells } from '@/render/tree/TreeMapLayout'
import Units from '@/helpers/Units'

const UNITS = new Units({ x: 1, y: 1 })

const BOX = { x: 0, y: 0, width: 100, height: 100 }

const getBoxes = (values: number[], box = BOX, gap = 0, units = UNITS) =>
    getCells(values, box, value => value, units, gap).map(cell => cell.box)

describe('Getting tree cells', () => {
    it('Should split area proportionally to values', () => {
        expect(getBoxes([3, 1]))
            .toEqual([
                { x: 0, y: 0, width: 75, height: 100 },
                { x: 75, y: 0, width: 25, height: 100 }
            ])
    })

    it('Should keep values in cells', () => {
        expect(getCells([3, 1], BOX, value => value, UNITS, 0).map(cell => cell.value))
            .toEqual([3, 1])
    })

    it('Should take row when box is taller than wide', () => {
        expect(getBoxes([1, 1], { x: 10, y: 20, width: 100, height: 200 }))
            .toEqual([
                { x: 10, y: 20, width: 100, height: 100 },
                { x: 10, y: 120, width: 100, height: 100 }
            ])
    })

    it('Should compare orientation in pixels', () => {
        expect(getBoxes([1, 1], BOX, 0, new Units({ x: 4, y: 1 }))[0])
            .toEqual({ x: 0, y: 0, width: 100, height: 50 })
    })

    it('Should subtract gap from every cell except last', () => {
        expect(getBoxes([3, 1], BOX, 10))
            .toEqual([
                { x: 0, y: 0, width: 65, height: 100 },
                { x: 75, y: 0, width: 25, height: 100 }
            ])
        expect(getBoxes([1, 1], { x: 0, y: 0, width: 100, height: 200 }, 10))
            .toEqual([
                { x: 0, y: 0, width: 100, height: 90 },
                { x: 0, y: 100, width: 100, height: 100 }
            ])
    })

    it('Should convert gap to units', () => {
        expect(getBoxes([1, 1], BOX, 10, new Units({ x: 2, y: 2 }))[0].width)
            .toBe(30)
    })

    it('Should not make cell size negative when gap is bigger than cell', () => {
        expect(getBoxes([1, 1], BOX, 200)[0].width)
            .toBe(0)
    })

    it('Should return no cells for no values', () => {
        expect(getBoxes([]))
            .toEqual([])
    })
})