import RenderItemArc from '@/types/RenderItemArc'
import { arc, WINDOW } from './RenderItemArcTestData'

const from = () => {
    const previous = new RenderItemArc()

    previous.absolute = { x: 0, y: 0 }
    previous.radius = 0

    return previous
}

describe('Adjusting arc to window', () => {
    it('Should map geometry to canvas', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect([target.canvas.x, target.canvas.y, target.canvas.radius])
            .toEqual([WINDOW.mapX(2500), WINDOW.mapY(2500), 500 * WINDOW.width / 5000])
    })

    it('Should interpolate from the previous geometry while morphing', () => {
        const target = arc()

        target.morphFrom(from(), 1)
        target.adjust(WINDOW, 0.5)

        expect([target.canvas.x, target.canvas.radius])
            .toEqual([WINDOW.mapX(1250), 250 * WINDOW.width / 5000])
    })

    it('Should use the target geometry when morph is complete', () => {
        const target = arc()

        target.morphFrom(from(), 1)
        target.adjust(WINDOW, 1)

        expect(target.canvas.x)
            .toBe(WINDOW.mapX(2500))
    })

    it('Should refresh the canvas geometry on every call', () => {
        const target = arc()

        target.adjust(WINDOW, 1)
        target.absolute = { x: 1000, y: 1000 }
        target.adjust(WINDOW, 1)

        expect(target.canvas.x)
            .toBe(WINDOW.mapX(1000))
    })
})