import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemText from '@/types/RenderItemText'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const CENTER = 2500

const SECTOR_START = 0

const SECTOR_END = 1

const SECTOR_MIDDLE = .5

const PREVIOUS_LABEL_OFFSET = .4

const NEXT_LABEL_OFFSET = 0

const WINDOW = new CanvasWindow(5000, 5000)

const context = () => ({
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    arc: jest.fn(),
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    closePath: jest.fn(),
    beginPath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    bezierCurveTo: jest.fn()
})

const sector = (labelOffset: number) => {
    const arc = new RenderItemArc()
    const text = new RenderItemText('label')

    arc.absolute = { x: CENTER, y: CENTER }
    arc.radius = 500
    arc.startAngle = SECTOR_START
    arc.endAngle = SECTOR_END
    arc.leaderGap = 20
    arc.leaderLength = 60
    arc.leaderOffset = labelOffset
    arc.leaderAnchor = labelOffset / 2

    text.angle = SECTOR_MIDDLE + labelOffset
    text.fontSize = 14
    text.orbit = { x: CENTER, y: CENTER, radiusX: 600, radiusY: 600 }

    arc.leaderLabel = new RenderItem(text)

    return { arc, text, label: arc.leaderLabel }
}

const leaderPath = (arc: RenderItemArc, morph: number = 1) => {
    const ctx = context()

    arc.adjust(WINDOW, morph)
    arc.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(arc))

    return {
        start: ctx.moveTo.mock.lastCall,
        curve: ctx.bezierCurveTo.mock.lastCall
    }
}

const morphedLeaderPath = (morph: number) => {
    const previous = sector(PREVIOUS_LABEL_OFFSET)
    const next = sector(NEXT_LABEL_OFFSET)

    leaderPath(previous.arc)

    next.arc.morphFrom(previous.arc, 1)
    next.text.morphFrom(previous.text, 1)
    next.label.animation.morph = morph

    return leaderPath(next.arc, morph)
}

const ring = (innerRadius: number, endAngle: number, cornerRadius: number, gap: number = 0) => {
    const arc = new RenderItemArc()
    const ctx = context()

    arc.absolute = { x: CENTER, y: CENTER }
    arc.radius = 500
    arc.innerRadius = innerRadius
    arc.startAngle = 0
    arc.endAngle = endAngle
    arc.cornerRadius = cornerRadius
    arc.gap = gap

    arc.adjust(WINDOW)
    arc.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(arc))

    return ctx
}

const arcRadii = (ctx: ReturnType<typeof context>) => {
    return ctx.arc.mock.calls.map(call => Number(call[2].toFixed(2)))
}

describe('Rendering arc', () => {
    it('Should keep the leader in place at the start of a morph', () => {
        expect(morphedLeaderPath(0)).toEqual(leaderPath(sector(PREVIOUS_LABEL_OFFSET).arc))
    })

    it('Should end the leader at the settled position after a morph', () => {
        expect(morphedLeaderPath(1)).toEqual(leaderPath(sector(NEXT_LABEL_OFFSET).arc))
    })

    it('Should keep corner radius that fits into the sector', () => {
        expect(arcRadii(ring(250, 1, 20)))
            .toEqual([20, 500, 20, 20, 250, 20])
    })

    it('Should limit corner radius by half of ring thickness', () => {
        expect(arcRadii(ring(480, 1, 50)))
            .toEqual([10, 500, 10, 10, 480, 10])
    })

    it('Should limit outer corner radius by outer arc of narrow sector', () => {
        expect(arcRadii(ring(0, .1, 100)))
            .toEqual([23.8, 500, 23.8])
    })

    it('Should limit inner corner radius by inner arc of narrow sector', () => {
        expect(arcRadii(ring(100, .2, 30)))
            .toEqual([30, 500, 30, 11.09, 100, 11.09])
    })

    it('Should move apex out of the center by the gap', () => {
        const [x, y] = ring(0, 1, 0, 20).lineTo.mock.lastCall

        expect(Math.hypot(x - CENTER, y - CENTER))
            .toBeCloseTo(20)
    })

    it('Should skip gradient when item has no fill colour', () => {
        const arc = new RenderItemArc()
        const ctx = { ...context(), createLinearGradient: jest.fn() }

        arc.absolute = { x: CENTER, y: CENTER }
        arc.radius = 500
        arc.endAngle = 1
        arc.isGradient = true

        arc.adjust(WINDOW)
        arc.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(arc))

        expect(ctx.createLinearGradient)
            .not.toHaveBeenCalled()
    })

})