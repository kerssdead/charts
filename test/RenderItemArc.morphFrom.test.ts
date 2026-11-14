import RenderItemArc from '@/types/RenderItemArc'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import HoverProgress from '@/types/HoverProgress'
import { FULL_ANGLE } from '@/static/constants/Index'

const WINDOW = new CanvasWindow(5000, 5000)

const arc = () => {
    const result = new RenderItemArc()

    result.absolute = { x: 2500, y: 2500 }
    result.radius = 500

    return result
}

const context = () => ({
    fillStyle: '',
    strokeStyle: '',
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    arc: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    beginPath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn()
})

describe('Morphing arc', () => {
    it('Should not morph from a different shape', () => {
        expect(arc().morphFrom({} as never, 1))
            .toBe(false)
    })

    it('Should take the previous geometry', () => {
        const previous = new RenderItemArc()

        previous.absolute = { x: 100, y: 200 }
        previous.radius = 50
        previous.innerRadius = 10
        previous.startAngle = .5
        previous.endAngle = 2
        previous.pull = 4

        const target = new RenderItemArc()

        expect(target.morphFrom(previous, 1))
            .toBe(true)
        expect(target.from)
            .toEqual({ x: 100, y: 200, radius: 50, innerRadius: 10, startAngle: .5, endAngle: 2, pull: 4 })
    })
})

describe('Disappearing arc', () => {
    it('Should shrink to the given angle', () => {
        const target = arc()

        target.disappearToAngle(.7, 0)

        expect(target.from)
            .toEqual({ x: 2500, y: 2500, radius: 500, innerRadius: 0, startAngle: 0, endAngle: FULL_ANGLE, pull: 0 })
        expect(target.startAngle)
            .toBe(.7)
        expect(target.endAngle)
            .toBe(.7)
    })
})

describe('Rendering arc', () => {
    it('Should apply the gradient when enabled and filled', () => {
        const target = arc()
        const item = new RenderItem(target)

        item.color = '#336699'
        target.isGradient = true
        target.endAngle = 1
        target.adjust(WINDOW)

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, item)

        expect(ctx.createLinearGradient)
            .toHaveBeenCalled()
        expect(ctx.fillStyle)
            .toBe(ctx.strokeStyle)
    })

    it('Should fill the arc when it is filled', () => {
        const target = arc()

        target.isFill = true
        target.endAngle = 1
        target.adjust(WINDOW)

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(target))

        expect(ctx.fill)
            .toHaveBeenCalled()
        expect(ctx.stroke)
            .toHaveBeenCalled()
    })

    it('Should skip drawing a collapsed arc', () => {
        const target = arc()

        target.startAngle = .5
        target.endAngle = .5
        target.adjust(WINDOW)

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(target))

        expect(ctx.stroke)
            .not.toHaveBeenCalled()
    })

    it('Should trace the inner circle of a full ring', () => {
        const target = arc()

        target.innerRadius = 200
        target.endAngle = Math.PI * 2
        target.adjust(WINDOW)

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(target))

        expect(ctx.moveTo)
            .toHaveBeenCalled()
        expect(ctx.arc.mock.calls.length)
            .toBeGreaterThanOrEqual(2)
    })

    it('Should grow the angles from the origin while initializing', () => {
        const target = arc()

        target.startAngle = 0
        target.endAngle = 1
        target.growOrigin = .5
        target.adjust(WINDOW)

        const item = new RenderItem(target)

        item.animation.init = .5

        const ctx = context()

        target.render(ctx as unknown as CanvasRenderingContext2D, item)

        const shape = (target as unknown as { drawnShape: { start: number, end: number } }).drawnShape

        expect(shape.start)
            .toBeCloseTo(.25, 3)
        expect(shape.end)
            .toBeCloseTo(.75, 3)
    })
})

describe('Bounding arc', () => {
    it('Should bound the arc by its radius', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect(target.getBounds())
            .toEqual({ left: 2000, top: 2000, right: 3000, bottom: 3000 })
    })
})

describe('Animating arc hover', () => {
    it('Should lift the hovered arc without a group', () => {
        jest.replaceProperty(HoverProgress, 'isInstant', true)

        const target = arc()

        target.animate(new RenderItem(target), false, 0)

        expect(target.hover)
            .toBe(1)

        target.animate(new RenderItem(target), true, 0)

        expect(target.hover)
            .toBe(0)
    })

    it('Should dim the arc of a hovered group', () => {
        jest.replaceProperty(HoverProgress, 'isInstant', true)

        const target = arc()
        const item = new RenderItem(target)

        item.hoverGroup = 'group'
        target.animate(item, false, 0)

        expect(item.animation.alpha)
            .toBe(.5)
    })
})

describe('Checking arc hover', () => {
    it('Should hit points inside the sector', () => {
        const target = arc()

        target.adjust(WINDOW)

        expect(target.isMouseOver({ x: 2500, y: 2500 }))
            .toBe(true)
        expect(target.isMouseOver({ x: 5000, y: 2500 }))
            .toBe(false)
    })
})
