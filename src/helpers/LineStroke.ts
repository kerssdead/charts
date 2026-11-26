import { LinePath } from '@/helpers/LineArea'

const PIECE_SEGMENTS = 16

const OPAQUE_COLOR_PREFIX = '#'

export function strokeLinePath(ctx: CanvasRenderingContext2D, path: LinePath) {
    if (canStrokeInPieces(ctx, path))
        strokePieces(ctx, path)
    else
        strokeWhole(ctx, path)
}

function canStrokeInPieces(ctx: CanvasRenderingContext2D, path: LinePath) {
    return path.lastPointIndex > PIECE_SEGMENTS
           && ctx.globalAlpha === 1
           && typeof ctx.strokeStyle === 'string'
           && ctx.strokeStyle.startsWith(OPAQUE_COLOR_PREFIX)
           && ctx.getLineDash().length === 0
}

function strokeWhole(ctx: CanvasRenderingContext2D, path: LinePath) {
    path.trace(ctx)
    ctx.stroke()
}

function strokePieces(ctx: CanvasRenderingContext2D, path: LinePath) {
    for (let start = 0; start < path.lastPointIndex; start += PIECE_SEGMENTS) {
        ctx.beginPath()
        path.traceSlice(ctx, {
            start: Math.max(start - 1, 0),
            end: Math.min(start + PIECE_SEGMENTS, path.lastPointIndex)
        })
        ctx.stroke()
    }
}