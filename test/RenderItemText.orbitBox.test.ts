import CanvasWindow from '@/types/CanvasWindow'
import RenderItemText from '@/types/RenderItemText'
import { boxEdgeDistance } from '@/helpers/Geometry'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const CENTER = 2500

const RADIUS = 1000

const SHORT_TEXT = 'a'.repeat(20)

const LONG_TEXT = 'a'.repeat(60)

const RIGHT_SIDE_ANGLE = .5

const LEFT_SIDE_ANGLE = Math.PI - .5

const WINDOW = new CanvasWindow(5000, 5000)

const label = (value: string, angle: number, radius: number = RADIUS) => {
    const result = new RenderItemText(value)

    result.angle = angle
    result.fontSize = 14
    result.orbit = { x: CENTER, y: CENTER, radiusX: radius, radiusY: radius }

    return result
}

const settledBox = (target: RenderItemText, window: CanvasWindow = WINDOW) => {
    target.adjust(window)

    return target.orbitBox()
}

const morphedBox = (previous: RenderItemText, next: RenderItemText, morph: number, previousMorph: number = 1) => {
    previous.adjust(WINDOW, previousMorph)
    next.morphFrom(previous, previousMorph)
    next.adjust(WINDOW, morph)

    return next.orbitBox()
}

describe('Getting orbit label box', () => {
    it('Should place a settled label on its orbit', () => {
        const box = settledBox(label(SHORT_TEXT, RIGHT_SIDE_ANGLE))
        const push = RADIUS + boxEdgeDistance(RIGHT_SIDE_ANGLE, 100, 7, RADIUS)

        expect(box.x).toBeCloseTo(CENTER + push * Math.cos(RIGHT_SIDE_ANGLE), 0)
        expect(box.y).toBeCloseTo(CENTER + push * Math.sin(RIGHT_SIDE_ANGLE), 0)
    })

    it('Should keep a label inside the right window edge', () => {
        const box = settledBox(label(LONG_TEXT, 0, 2400))

        expect(box.x + box.halfWidth).toBe(5000)
    })

    it('Should keep a label inside the left window edge', () => {
        const box = settledBox(label(LONG_TEXT, Math.PI, 2400))

        expect(box.x - box.halfWidth).toBe(0)
    })

    it('Should keep a label inside the bottom window edge', () => {
        const box = settledBox(label(LONG_TEXT, Math.PI / 2, 2499))

        expect(box.y + box.halfHeight).toBe(5000)
    })

    it('Should keep a label inside the top window edge', () => {
        const box = settledBox(label(LONG_TEXT, -Math.PI / 2, 2499))

        expect(box.y - box.halfHeight).toBe(0)
    })

    it('Should keep a label inside a window with an offset', () => {
        const window = new CanvasWindow(5000, 5000)

        window.x = 1000
        window.y = 500

        const box = settledBox(label(LONG_TEXT, Math.PI, 2400), window)

        expect(box.x - box.halfWidth).toBe(1000)
    })

    it('Should keep a widened label inside the window while its angle morphs', () => {
        const previous = label(SHORT_TEXT, .1, 2200)
        const next = label(LONG_TEXT, Math.PI / 4, 2200)

        for (const morph of [0, .25]) {
            const box = morphedBox(previous, next, morph)

            expect(box.x + box.halfWidth).toBe(5000)
        }
    })

    it('Should not move a label on the right side when its text gets shorter', () => {
        const previous = label(LONG_TEXT, RIGHT_SIDE_ANGLE)
        const before = settledBox(previous)
        const box = morphedBox(previous, label(SHORT_TEXT, RIGHT_SIDE_ANGLE + .2), 0)

        expect(box.x - box.halfWidth).toBeCloseTo(before.x - before.halfWidth)
        expect(box.y).toBeCloseTo(before.y)
    })

    it('Should not move a label on the right side when its text gets longer', () => {
        const previous = label(SHORT_TEXT, RIGHT_SIDE_ANGLE)
        const before = settledBox(previous)
        const box = morphedBox(previous, label(LONG_TEXT, RIGHT_SIDE_ANGLE + .2), 0)

        expect(box.x - box.halfWidth).toBeCloseTo(before.x - before.halfWidth)
        expect(box.y).toBeCloseTo(before.y)
    })

    it('Should not move a label on the left side when its text gets shorter', () => {
        const previous = label(LONG_TEXT, LEFT_SIDE_ANGLE)
        const before = settledBox(previous)
        const box = morphedBox(previous, label(SHORT_TEXT, LEFT_SIDE_ANGLE - .2), 0)

        expect(box.x + box.halfWidth).toBeCloseTo(before.x + before.halfWidth)
        expect(box.y).toBeCloseTo(before.y)
    })

    it('Should continue from the current position when a morph is interrupted', () => {
        const first = label(LONG_TEXT, RIGHT_SIDE_ANGLE)
        const second = label(SHORT_TEXT, RIGHT_SIDE_ANGLE + .2)
        const before = morphedBox(first, second, .5)
        const box = morphedBox(second, label(LONG_TEXT, RIGHT_SIDE_ANGLE), 0, .5)

        expect(box.x - box.halfWidth).toBeCloseTo(before.x - before.halfWidth)
        expect(box.y).toBeCloseTo(before.y)
    })

    it('Should end a morph at the settled position', () => {
        const box = morphedBox(label(LONG_TEXT, RIGHT_SIDE_ANGLE), label(SHORT_TEXT, RIGHT_SIDE_ANGLE + .2), 1)

        expect(box).toEqual(settledBox(label(SHORT_TEXT, RIGHT_SIDE_ANGLE + .2)))
    })

    it('Should use the text width when morphing from a label without an orbit', () => {
        const previous = new RenderItemText(LONG_TEXT)

        expect(morphedBox(previous, label(SHORT_TEXT, RIGHT_SIDE_ANGLE), 0).halfWidth).toBe(100)
        expect(morphedBox(previous, label(SHORT_TEXT, RIGHT_SIDE_ANGLE), 0))
            .toEqual(settledBox(label(SHORT_TEXT, RIGHT_SIDE_ANGLE)))
    })
})