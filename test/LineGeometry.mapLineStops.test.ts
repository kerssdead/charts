import { mapLineStops } from '@/helpers/LineGeometry'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

describe('Mapping line stops to the canvas', () => {
    it('Should map stops into canvas coordinates', () => {
        const { canvas, isSortedX } = mapLineStops(WINDOW, [
            { x: 0, y: 0 },
            { x: 1000, y: 2500 }
        ], [])

        expect(canvas)
            .toEqual([{ x: 0, y: 0 }, { x: 100, y: 250 }])
        expect(isSortedX)
            .toBe(true)
    })

    it('Should reuse the canvas array when the stop count is unchanged', () => {
        const existing = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
        const { canvas } = mapLineStops(WINDOW, [{ x: 0, y: 0 }, { x: 1000, y: 1000 }], existing)

        expect(canvas)
            .toBe(existing)
    })

    it('Should detect stops that are not sorted by x', () => {
        const { isSortedX } = mapLineStops(WINDOW, [
            { x: 2000, y: 0 },
            { x: 1000, y: 0 }
        ], [])

        expect(isSortedX)
            .toBe(false)
    })
})
