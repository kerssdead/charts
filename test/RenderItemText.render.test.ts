import RenderItemText from '@/types/RenderItemText'
import RenderItemArc from '@/types/RenderItemArc'
import CanvasWindow from '@/types/CanvasWindow'
import { TextAlignment, TextBaseline, TextDirection } from '@/static/Enums'
import { LIGHT_THEME } from '@/Theme'

const THEME = { ...LIGHT_THEME, text: '#123456' }

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const WINDOW = new CanvasWindow(5000, 5000)

const text = () => {
    const result = new RenderItemText('Label')

    result.absolute = { x: 1000, y: 2000 }
    result.fontSize = 14
    result.baseline = TextBaseline.Middle

    return result
}

const context = () => ({
    font: '',
    direction: 'inherit',
    textAlign: '',
    textBaseline: '',
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    fillText: jest.fn()
})

describe('Text color and font', () => {
    it('Should use the theme text color', () => {
        expect(text().defaultColor(THEME))
            .toBe('#123456')
    })
})

describe('Moving text along the axis', () => {
    it('Should remember the entry position', () => {
        const target = text()

        expect(target.enterFromAxis(3000))
            .toBe(true)
        expect(target.from)
            .toEqual({ x: 1000, y: 3000 })
    })

    it('Should keep the current position and set the new axis', () => {
        const target = text()

        target.from = { x: 0, y: 0 }
        target.leaveToAxis(3000, .5)

        expect(target.from)
            .toEqual({ x: 500, y: 1000 })
        expect(target.absolute.y)
            .toBe(3000)
    })
})

describe('Morphing text', () => {
    it('Should not morph from a different shape', () => {
        expect(text().morphFrom({} as never, 1))
            .toBe(false)
    })

    it('Should remember the previous angle and orbit width', () => {
        const previous = new RenderItemText('Prev')

        previous.angle = .5
        previous.orbit = { x: 0, y: 0, radiusX: 10, radiusY: 10 }

        const target = text()

        target.orbit = { x: 2500, y: 2500, radiusX: 1000, radiusY: 1000 }

        expect(target.morphFrom(previous, 1))
            .toBe(true)
        expect(target.fromAngle)
            .toBe(.5)
        expect(target.fromOrbitHalfWidth)
            .toBe(20)
    })
})

describe('Interpolating current position', () => {
    it('Should interpolate from the previous position', () => {
        const target = text()

        target.from = { x: 0, y: 0 }

        expect(target.current(.5))
            .toEqual({ x: 500, y: 1000 })
        expect(target.current(1))
            .toEqual({ x: 1000, y: 2000 })
    })
})

describe('Rendering text', () => {
    it('Should draw plain text at the canvas position', () => {
        const target = text()
        const ctx = context()

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.font)
            .toBe('14px Arial')
        expect(ctx.textAlign)
            .toBe(TextAlignment.Center)
        expect(ctx.textBaseline)
            .toBe(TextBaseline.Middle)
        expect(ctx.fillText)
            .toHaveBeenCalledWith('Label', 1000, 2000)
    })

    it('Should draw rotated text around the canvas position', () => {
        const target = text()

        target.rotate = Math.PI / 2

        const ctx = context()

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.save)
            .toHaveBeenCalled()
        expect(ctx.translate)
            .toHaveBeenCalledWith(1000, 2000)
        expect(ctx.rotate)
            .toHaveBeenCalledWith(Math.PI / 2)
        expect(ctx.fillText)
            .toHaveBeenCalledWith('Label', 0, 0)
        expect(ctx.restore)
            .toHaveBeenCalled()
    })

    it('Should draw text clipped to its clip width', () => {
        const target = text()

        target.clipWidth = 2000

        const ctx = context()

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.save)
            .toHaveBeenCalled()
        expect(ctx.rect)
            .toHaveBeenCalled()
        expect(ctx.clip)
            .toHaveBeenCalled()
        expect(ctx.fillText)
            .toHaveBeenCalledWith('Label', 1000, 2000)
        expect(ctx.restore)
            .toHaveBeenCalled()
    })

    it('Should draw orbit text at its box', () => {
        const target = text()

        target.orbit = { x: 2500, y: 2500, radiusX: 1000, radiusY: 1000 }
        target.angle = 0

        const ctx = context()

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.textAlign)
            .toBe(TextAlignment.Center)
        expect(ctx.textBaseline)
            .toBe(TextBaseline.Middle)
        expect(ctx.fillText)
            .toHaveBeenCalledWith('Label', expect.any(Number), expect.any(Number))
    })

    it('Should shift text by the followed arc pop', () => {
        const target = text()
        const arc = new RenderItemArc()

        arc.pop.x = 100
        arc.pop.y = -50
        target.follow = arc

        const ctx = context()

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(ctx.fillText)
            .toHaveBeenCalledWith('Label', 1100, 1950)
    })

    it.each([
        ['plain', () => text()],
        ['rotated', () => Object.assign(text(), { rotate: Math.PI / 2 })],
        ['clipped', () => Object.assign(text(), { clipWidth: 2000 })],
        ['orbit', () => Object.assign(text(), { orbit: { x: 2500, y: 2500, radiusX: 1000, radiusY: 1000 } })]
    ])('Should draw %s text left-to-right even on a right-to-left page', (_, create) => {
        const target = create()
        const ctx = context()
        const directions: string[] = []

        ctx.fillText.mockImplementation(() => directions.push(ctx.direction))

        target.adjust(WINDOW)
        target.render(ctx as unknown as CanvasRenderingContext2D)

        expect(directions)
            .toEqual([TextDirection.LeftToRight])
    })
})