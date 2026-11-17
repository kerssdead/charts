import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'

describe('Updating panel', () => {
    it('Should place the panel window inside the canvas window', () => {
        const panel = new Panel(0, { x: .5, y: 0, width: .5, height: 1 })

        panel.update(new CanvasWindow(200, 100))

        expect([panel.window.x, panel.window.y, panel.window.width, panel.window.height])
            .toEqual([100, 0, 100, 100])
    })

    it('Should zoom by the ratio of window and base height', () => {
        const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })
        const window = new CanvasWindow(200, 100)

        window.height = 200
        panel.update(window)

        expect(panel.zoom)
            .toBe(2)
    })

    it('Should not zoom without a base height', () => {
        const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })
        const window = new CanvasWindow(0, 0)

        panel.update(window)

        expect(panel.zoom)
            .toBe(1)
    })
})
