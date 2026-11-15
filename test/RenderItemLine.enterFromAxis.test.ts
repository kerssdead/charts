import RenderItemLine from '@/types/RenderItemLine'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'

const WINDOW = new CanvasWindow(500, 500)

const STOPS = [{ x: 100, y: 100 }, { x: 300, y: 100 }]

const line = () => {
    const result = new RenderItemLine()

    result.absolute = STOPS

    return result
}

describe('Moving line along the axis', () => {
    it('Should keep every stop on the entry axis', () => {
        const target = line()

        expect(target.enterFromAxis(300))
            .toBe(true)
        expect(target.from)
            .toEqual([{ x: 100, y: 300 }, { x: 300, y: 300 }])
    })

    it('Should keep the current position and set the new axis', () => {
        const target = line()

        target.from = STOPS.map(stop => ({ x: stop.x, y: 100 }))
        target.leaveToAxis(300, .5)

        expect(target.from)
            .toEqual([{ x: 100, y: 100 }, { x: 300, y: 100 }])
        expect(target.absolute)
            .toEqual([{ x: 100, y: 300 }, { x: 300, y: 300 }])
    })
})

describe('Animating line hover', () => {
    it('Should not animate lines without a hover group', () => {
        const target = line()
        const item = new RenderItem(target)

        target.animate(item, false, 0)

        expect(item.animation.alpha)
            .toBe(1)
    })

    it('Should dim lines whose group is hovered', () => {
        const target = line()
        const item = new RenderItem(target)

        item.isInstant = true
        item.hoverGroup = 'group'
        target.animate(item, false, 0)

        expect(item.animation.alpha)
            .toBe(.5)
    })
})

describe('Rendering line', () => {
    it('Should skip rendering without stops', () => {
        const target = new RenderItemLine()
        const ctx = { stroke: jest.fn() }

        target.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(target))

        expect(ctx.stroke)
            .not.toHaveBeenCalled()
    })

    it('Should apply the gradient when the line is filled', () => {
        const target = line()
        const item = new RenderItem(target)

        item.color = '#336699'
        target.isGradient = true
        target.adjust(WINDOW)

        const ctx = {
            lineWidth: 1,
            setLineDash: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            fill: jest.fn(),
            arc: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            beginPath: jest.fn()
        }

        target.render(ctx as unknown as CanvasRenderingContext2D, item)

        expect(ctx.createLinearGradient)
            .toHaveBeenCalled()
        expect(ctx.stroke)
            .toHaveBeenCalled()
    })
})

describe('Getting line tooltip', () => {
    it('Should return nothing when tooltips do not match the stops', () => {
        const target = line()

        target.adjust(WINDOW)

        expect(target.tooltipAt({ x: 100, y: 100 }))
            .toBeNull()
    })
})
