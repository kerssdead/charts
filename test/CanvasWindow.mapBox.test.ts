import CanvasWindow from '@/types/CanvasWindow'

describe('Mapping a box to the canvas', () => {
    it('Should map the position and scale the size', () => {
        expect(new CanvasWindow(1000, 500).mapBox({ x: 1000, y: 2000, width: 500, height: 250 }))
            .toEqual({ x: 200, y: 200, width: 100, height: 25 })
    })

    it('Should follow the window position', () => {
        const window = new CanvasWindow(1000, 1000)

        window.x = 10
        window.y = 20

        expect(window.mapBox({ x: 0, y: 0, width: 5000, height: 5000 }))
            .toEqual({ x: 10, y: 20, width: 1000, height: 1000 })
    })

    it('Should fill the given box and return it', () => {
        const result = { x: 0, y: 0, width: 0, height: 0 }

        expect(new CanvasWindow(1000, 1000).mapBox({ x: 500, y: 500, width: 500, height: 500 }, result))
            .toBe(result)
        expect(result)
            .toEqual({ x: 100, y: 100, width: 100, height: 100 })
    })
})