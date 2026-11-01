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
    const text = new RenderItemText()

    arc.absolute = { x: CENTER, y: CENTER }
    arc.radius = 500
    arc.startAngle = SECTOR_START
    arc.endAngle = SECTOR_END
    arc.leaderGap = 20
    arc.leaderLength = 60
    arc.leaderOffset = labelOffset
    arc.leaderAnchor = labelOffset / 2

    text.value = 'label'
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

describe('Rendering arc', () => {
    it('Should keep the leader in place at the start of a morph', () => {
        expect(morphedLeaderPath(0)).toEqual(leaderPath(sector(PREVIOUS_LABEL_OFFSET).arc))
    })

    it('Should end the leader at the settled position after a morph', () => {
        expect(morphedLeaderPath(1)).toEqual(leaderPath(sector(NEXT_LABEL_OFFSET).arc))
    })
})