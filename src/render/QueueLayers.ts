import CachedLayer from '@/render/CachedLayer'
import Span from '@/types/Span'

export type LayerPainter = {
    background: (ctx: CanvasRenderingContext2D) => void
    items: (ctx: CanvasRenderingContext2D, start: number, end: number) => void
}

export type LayerFrame = {
    version: number
    ratio: number
    itemCount: number
    changed: Span | null
}

export default class QueueLayers {
    private readonly below = new CachedLayer()

    private readonly above = new CachedLayer()

    draw(ctx: CanvasRenderingContext2D, frame: LayerFrame, painter: LayerPainter) {
        const liveStart = frame.changed?.start ?? frame.itemCount
        const liveEnd = frame.changed ? frame.changed.end + 1 : frame.itemCount

        this.drawBelow(ctx, liveStart, frame, painter)
        painter.items(ctx, liveStart, liveEnd)
        this.drawAbove(ctx, liveEnd, frame, painter)
    }

    invalidate() {
        this.below.invalidate()
        this.above.invalidate()
    }

    release() {
        this.below.release()
        this.above.release()
    }

    private drawBelow(ctx: CanvasRenderingContext2D, end: number, frame: LayerFrame, painter: LayerPainter) {
        if (end === 0) {
            painter.background(ctx)

            return
        }

        const layer = this.below

        if (layer.end > end)
            layer.invalidate()

        const { ctx: layerCtx, isReset } = layer.open(frame.version, ctx.canvas, frame.ratio)

        if (isReset) {
            painter.background(layerCtx)
            layer.end = 0
        }

        if (layer.end < end) {
            painter.items(layerCtx, layer.end, end)
            layer.end = end
        }

        layer.drawTo(ctx, frame.ratio)
    }

    private drawAbove(ctx: CanvasRenderingContext2D, start: number, frame: LayerFrame, painter: LayerPainter) {
        if (start >= frame.itemCount)
            return

        const layer = this.above

        if (layer.start !== start)
            layer.invalidate()

        const { ctx: layerCtx, isReset } = layer.open(frame.version, ctx.canvas, frame.ratio)

        if (isReset) {
            painter.items(layerCtx, start, frame.itemCount)
            layer.start = start
        }

        layer.drawTo(ctx, frame.ratio)
    }
}