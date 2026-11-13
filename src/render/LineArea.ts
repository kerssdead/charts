import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { Bounds } from '@/types/interfaces/RenderItemBase'
import { lerp } from '@/helpers/Geometry'
import { withAlpha } from '@/helpers/Color'
import { edgeFadeMask, fadingGradient, GradientCache, offscreenLayer } from '@/helpers/Canvas'
import { CompositeOperation } from '@/static/Enums'

const AREA_EDGE_FADE = 12

const AREA_TOP_ALPHA = 0.5

export type LinePath = {
    left: number
    right: number
    trace: (ctx: CanvasRenderingContext2D) => void
}

export default class LineArea {
    baseline: number | null = null

    canvasBaseline: number = 0

    private fromBaseline: number | null = null

    private readonly gradient = new GradientCache(fadingGradient)

    current(morph: number = 1): number | null {
        if (this.baseline == null || this.fromBaseline == null || morph >= 1)
            return this.baseline

        return lerp(this.fromBaseline, this.baseline, morph)
    }

    morphFrom(previous: LineArea, morph: number) {
        this.fromBaseline = previous.current(morph)
    }

    adjust(window: CanvasWindow, morph: number) {
        const baseline = this.current(morph)

        if (baseline != null)
            this.canvasBaseline = RenderItem.adjustY(window, baseline)
    }

    fill(ctx: CanvasRenderingContext2D, color: string, { top, bottom }: Bounds, { left, right, trace }: LinePath) {
        const scale = ctx.getTransform().a
        const pixelWidth = Math.ceil((right - left) * scale)
        const pixelHeight = Math.ceil((bottom - top) * scale)

        if (pixelWidth <= 0 || pixelHeight <= 0)
            return

        const layer = offscreenLayer(ctx)

        layer.setTransform(1, 0, 0, 1, 0, 0)
        layer.clearRect(0, 0, pixelWidth, pixelHeight)
        layer.setTransform(scale, 0, 0, scale, -left * scale, -top * scale)

        layer.beginPath()
        trace(layer)
        layer.lineTo(right, this.canvasBaseline)
        layer.lineTo(left, this.canvasBaseline)
        layer.closePath()

        layer.fillStyle = this.gradient.get(layer, withAlpha(color, AREA_TOP_ALPHA), top, bottom)
        layer.fill()

        layer.globalCompositeOperation = CompositeOperation.DestinationIn
        layer.fillStyle = edgeFadeMask(layer, left, right, AREA_EDGE_FADE)
        layer.fillRect(left, top, right - left, bottom - top)
        layer.globalCompositeOperation = CompositeOperation.SourceOver

        ctx.drawImage(
            layer.canvas,
            0,
            0,
            pixelWidth,
            pixelHeight,
            left,
            top,
            pixelWidth / scale,
            pixelHeight / scale
        )
    }

    clip(ctx: CanvasRenderingContext2D, { top, bottom }: Bounds, { left, right }: LinePath) {
        ctx.rect(left, top, right - left, bottom - top)
        ctx.clip()

        ctx.beginPath()
    }
}