import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import RenderItemArc, { HOVER_OFFSET } from '@/types/RenderItemArc'
import RenderItemText from '@/types/RenderItemText'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'

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

    text.angle = SECTOR_MIDDLE + labelOffset
    text.fontSize = 14
    text.orbit = { x: CENTER, y: CENTER, radiusX: 600, radiusY: 600 }

    const leader = new RenderItemLeaderLine(arc, new RenderItem(arc))

    leader.gap = 20
    leader.length = 60
    leader.offset = labelOffset
    leader.anchor = labelOffset / 2
    leader.target = text
    leader.targetItem = new RenderItem(text)

    return { arc, text, leader, label: leader.targetItem }
}

const leaderPath = (arc: RenderItemArc, leader: RenderItemLeaderLine, morph: number = 1) => {
    const ctx = context() as unknown as CanvasRenderingContext2D
    const recorder = ctx as unknown as ReturnType<typeof context>

    arc.adjust(WINDOW, morph)
    arc.render(ctx, new RenderItem(arc))

    leader.adjust(WINDOW, morph)
    leader.render(ctx)

    return {
        start: recorder.moveTo.mock.lastCall,
        curve: recorder.bezierCurveTo.mock.lastCall
    }
}

const settledLeaderPath = (labelOffset: number) => {
    const { arc, leader } = sector(labelOffset)

    return leaderPath(arc, leader)
}

const morphedLeaderPath = (morph: number) => {
    const previous = sector(PREVIOUS_LABEL_OFFSET)
    const next = sector(NEXT_LABEL_OFFSET)

    leaderPath(previous.arc, previous.leader)

    next.arc.morphFrom(previous.arc, 1)
    next.leader.morphFrom(previous.leader, 1)
    next.text.morphFrom(previous.text, 1)
    next.label.animation.morph = morph

    return leaderPath(next.arc, next.leader, morph)
}

const draw = (prepare: (parts: ReturnType<typeof sector>) => void) => {
    const parts = sector(NEXT_LABEL_OFFSET)
    const ctx = context()

    prepare(parts)

    parts.arc.adjust(WINDOW)
    parts.arc.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(parts.arc))

    ctx.globalAlpha = 1
    ctx.stroke.mockClear()

    parts.leader.adjust(WINDOW)
    parts.leader.render(ctx as unknown as CanvasRenderingContext2D)

    return ctx
}

describe('Rendering leader line', () => {
    it('Should keep the leader in place at the start of a morph', () => {
        expect(morphedLeaderPath(0)).toEqual(settledLeaderPath(PREVIOUS_LABEL_OFFSET))
    })

    it('Should end the leader at the settled position after a morph', () => {
        expect(morphedLeaderPath(1)).toEqual(settledLeaderPath(NEXT_LABEL_OFFSET))
    })

    it('Should not draw without a target', () => {
        expect(draw(({ leader }) => leader.target = null).stroke)
            .not.toHaveBeenCalled()
    })

    it('Should not draw while the target is hidden', () => {
        expect(draw(({ label }) => label.animation.visibility = 0).stroke)
            .not.toHaveBeenCalled()
    })

    it('Should fade with the origin and the target', () => {
        const ctx = draw(({ leader, label }) => {
            leader.originItem.animation.visibility = .5
            label.animation.visibility = .4
        })

        expect(ctx.globalAlpha)
            .toBeCloseTo(.2)
    })

    it('Should start beyond the arc by the gap and the hover lift', () => {
        const ctx = draw(({ arc }) => arc.hover = 1)
        const [x, y] = ctx.moveTo.mock.lastCall

        expect(Math.hypot(x - CENTER, y - CENTER))
            .toBeCloseTo(500 + 20 + HOVER_OFFSET)
    })
})