import CanvasWindow from '@/types/CanvasWindow'

describe('Scaling a horizontal length to the canvas', () => {
    it('Should scale the length by the window width', () => {
        expect(new CanvasWindow(1000, 500).scaleX(500))
            .toBe(100)
    })

    it('Should ignore the window position', () => {
        const window = new CanvasWindow(1000, 500)

        window.x = 10

        expect(window.scaleX(500))
            .toBe(100)
    })

    it('Should follow the zoomed width', () => {
        const window = new CanvasWindow(1000, 500)

        window.zoom(.5, { x: 0, y: 0 })

        expect(window.scaleX(500))
            .toBe(150)
    })
})