import RenderItemLine from '@/types/RenderItemLine'
import CanvasWindow from '@/types/CanvasWindow'
import RectangleDimensions from '@/types/RectangleDimensions'

const WINDOW = new CanvasWindow(500, 500)

const createLine = (clip: RectangleDimensions | null = null) => {
    const shape = new RenderItemLine()

    shape.absolute = [{ x: 1000, y: 500 }, { x: 2000, y: 2000 }]
    shape.width = 2
    shape.clip = clip
    shape.adjust(WINDOW)

    return shape
}

describe('Checking whether pointer is over line', () => {
    it('Should be over a stop near the pointer', () => {
        expect(createLine().isMouseOver({ x: 102, y: 51 }))
            .toBe(true)
    })

    it('Should not be over a line far from its stops', () => {
        expect(createLine().isMouseOver({ x: 150, y: 120 }))
            .toBe(false)
    })

    it('Should not be over a stop outside the clip box', () => {
        const line = createLine({ x: 0, y: 1000, width: 5000, height: 4000 })

        expect([line.isMouseOver({ x: 100, y: 50 }), line.isMouseOver({ x: 200, y: 200 })])
            .toEqual([false, true])
    })

    it('Should find the closest stop on a long sorted line', () => {
        const shape = new RenderItemLine()

        shape.absolute = Array.from({ length: 100 }, (_, i) => ({ x: 1000 + i * 50, y: 500 }))
        shape.width = 2
        shape.adjust(WINDOW)

        expect([shape.isMouseOver({ x: 102, y: 51 }), shape.isMouseOver({ x: 102, y: 200 })])
            .toEqual([true, false])
    })

    it('Should scan stops that are not sorted by x', () => {
        const shape = new RenderItemLine()

        shape.absolute = [{ x: 3000, y: 500 }, { x: 1000, y: 500 }, { x: 2000, y: 500 }]
        shape.width = 2
        shape.adjust(WINDOW)

        expect([
            shape.isMouseOver({ x: 302, y: 51 }),
            shape.isMouseOver({ x: 102, y: 51 }),
            shape.isMouseOver({ x: 202, y: 51 })
        ])
            .toEqual([true, true, true])
    })

    it('Should resolve the tooltip at the hovered stop', () => {
        const shape = new RenderItemLine()

        shape.absolute = [{ x: 1000, y: 500 }, { x: 2000, y: 500 }]
        shape.tooltips = [() => 'first', 'second']
        shape.adjust(WINDOW)

        expect([shape.tooltipAt({ x: 102, y: 51 }), shape.tooltipAt({ x: 202, y: 51 })])
            .toEqual(['first', 'second'])
    })

    it('Should highlight the marker at the hovered stop and hide it away from the line', () => {
        const shape = new RenderItemLine()

        shape.absolute = [{ x: 1000, y: 500 }, { x: 2000, y: 500 }]
        shape.adjust(WINDOW)

        shape.animateHover({ x: 202, y: 51 }, 0)

        expect(shape.animateHover({ x: 202, y: 51 }, 100))
            .toBe(true)

        shape.animateHover({ x: 202, y: 51 }, 200)

        expect(shape.animateHover({ x: 202, y: 51 }, 400))
            .toBe(false)

        expect(shape.animateHover(null, 500))
            .toBe(true)

        expect(shape.animateHover(null, 700))
            .toBe(false)
    })

    it('Should keep the hovered marker when other points are queried', () => {
        const shape = new RenderItemLine()

        shape.absolute = [{ x: 1000, y: 500 }, { x: 2000, y: 500 }]
        shape.tooltips = ['first', 'second']
        shape.adjust(WINDOW)

        shape.animateHover({ x: 102, y: 51 }, 0)
        shape.animateHover({ x: 102, y: 51 }, 200)
        shape.isMouseOver({ x: 202, y: 51 })
        shape.tooltipAt({ x: 202, y: 51 })

        expect(shape.animateHover({ x: 102, y: 51 }, 400))
            .toBe(false)
    })
})