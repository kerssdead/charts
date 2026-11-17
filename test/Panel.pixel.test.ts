import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'

describe('Getting panel pixel', () => {
    it('Should divide the window pixel by the panel share', () => {
        const window = new CanvasWindow(200, 100)
        const full = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })
        const half = new Panel(1, { x: 0, y: 0, width: .5, height: .5 })

        expect(half.pixel(window))
            .toEqual({ x: full.pixel(window).x * 2, y: full.pixel(window).y * 2 })
    })

    it('Should not divide by an empty panel', () => {
        const window = new CanvasWindow(200, 100)
        const empty = new Panel(0, { x: 0, y: 0, width: 0, height: 0 })

        expect(empty.pixel(window))
            .toEqual(window.pixel)
    })
})
