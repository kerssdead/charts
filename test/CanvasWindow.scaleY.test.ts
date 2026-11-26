import CanvasWindow from '@/types/CanvasWindow'

describe('Scaling a vertical length to the canvas', () => {
    it('Should scale the length by the window height', () => {
        expect(new CanvasWindow(1000, 500).scaleY(500))
            .toBe(50)
    })

    it('Should ignore the window position', () => {
        const window = new CanvasWindow(1000, 500)

        window.y = 20

        expect(window.scaleY(500))
            .toBe(50)
    })

    it('Should follow the zoomed height', () => {
        const window = new CanvasWindow(1000, 500)

        window.zoom(.5, { x: 0, y: 0 })

        expect(window.scaleY(500))
            .toBe(75)
    })
})