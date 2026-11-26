import { strokeLinePath } from '@/helpers/LineStroke'
import { LinePath } from '@/helpers/LineArea'

type Style = { globalAlpha?: number, strokeStyle?: unknown, dash?: number[] }

const context = ({ globalAlpha = 1, strokeStyle = '#ff0000', dash = [] }: Style = {}) => ({
    globalAlpha,
    strokeStyle,
    beginPath: jest.fn(),
    stroke: jest.fn(),
    getLineDash: () => dash
})

const path = (lastPointIndex: number): LinePath & { trace: jest.Mock, traceSlice: jest.Mock } => ({
    left: 0,
    right: 100,
    lastPointIndex,
    trace: jest.fn(),
    traceSlice: jest.fn()
})

const stroke = (lastPointIndex: number, style: Style = {}) => {
    const ctx = context(style)
    const linePath = path(lastPointIndex)

    strokeLinePath(ctx as unknown as CanvasRenderingContext2D, linePath)

    return { ctx, linePath }
}

const slices = (linePath: ReturnType<typeof path>) => linePath.traceSlice.mock.calls.map(call => call[1])

describe('Stroking line path', () => {
    it('Should stroke a short line as a whole path', () => {
        const { ctx, linePath } = stroke(16)

        const callCounts = [linePath.trace, linePath.traceSlice, ctx.stroke].map(mock => mock.mock.calls.length)

        expect(callCounts)
            .toEqual([1, 0, 1])
    })

    it('Should stroke a long opaque line in pieces overlapping by one segment', () => {
        expect(slices(stroke(40).linePath))
            .toEqual([{ start: 0, end: 16 }, { start: 15, end: 32 }, { start: 31, end: 40 }])
    })

    it('Should start a new path for every piece', () => {
        const { ctx } = stroke(40)

        expect([ctx.beginPath.mock.calls.length, ctx.stroke.mock.calls.length])
            .toEqual([3, 3])
    })

    it('Should stroke a translucent line as a whole path', () => {
        expect(stroke(40, { globalAlpha: .5 }).linePath.trace)
            .toHaveBeenCalled()
    })

    it('Should stroke a line with a translucent color as a whole path', () => {
        expect(stroke(40, { strokeStyle: 'rgba(255, 0, 0, 0.5)' }).linePath.trace)
            .toHaveBeenCalled()
    })

    it('Should stroke a gradient line as a whole path', () => {
        expect(stroke(40, { strokeStyle: {} }).linePath.trace)
            .toHaveBeenCalled()
    })

    it('Should stroke a dashed line as a whole path', () => {
        expect(stroke(40, { dash: [4, 2] }).linePath.trace)
            .toHaveBeenCalled()
    })
})