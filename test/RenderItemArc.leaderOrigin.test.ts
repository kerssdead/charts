import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import RenderItemArc, { HOVER_OFFSET } from '@/types/RenderItemArc'
import { FULL_ANGLE } from '@/static/constants/Index'

const CENTER = 2500

const MIDDLE = .5

const WINDOW = new CanvasWindow(5000, 5000)

const HALF_WINDOW = new CanvasWindow(2500, 2500)

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
    stroke: jest.fn()
})

const drawnArc = (extra: Partial<RenderItemArc> = {}, window: CanvasWindow = WINDOW) => {
    const arc = Object.assign(new RenderItemArc(), {
        absolute: { x: CENTER, y: CENTER },
        radius: 500,
        startAngle: 0,
        endAngle: 2 * MIDDLE,
        ...extra
    })

    arc.adjust(window)
    arc.render(context() as unknown as CanvasRenderingContext2D, new RenderItem(arc))

    return arc
}

const rounded = (origin: ReturnType<RenderItemArc['leaderOrigin']>) => {
    return Object.values(origin).map(value => Number(value.toFixed(6)))
}

describe('Getting arc leader origin', () => {
    it('Should start from the arc centre at its middle angle and radius', () => {
        expect(drawnArc().leaderOrigin())
            .toEqual({ x: CENTER, y: CENTER, angle: MIDDLE, distance: 500, lift: 0 })
    })

    it('Should scale with the window', () => {
        expect(drawnArc({}, HALF_WINDOW).leaderOrigin())
            .toEqual({ x: CENTER / 2, y: CENTER / 2, angle: MIDDLE, distance: 250, lift: 0 })
    })

    it('Should move with the pull and report hover as lift', () => {
        const origin = drawnArc({ pull: 100, hover: 1 }).leaderOrigin()

        expect(rounded(origin))
            .toEqual(rounded({
                x: CENTER + 100 * Math.cos(MIDDLE),
                y: CENTER + 100 * Math.sin(MIDDLE),
                angle: MIDDLE,
                distance: 500,
                lift: HOVER_OFFSET
            }))
    })

    it('Should not lift a full circle', () => {
        expect(drawnArc({ endAngle: FULL_ANGLE, hover: 1 }).leaderOrigin().lift)
            .toBe(0)
    })
})