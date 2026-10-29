import Point from '@/types/Point'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, FULL_ANGLE } from '@/static/constants/Index'
import { lerp } from '@/helpers/Geometry'
import HoverMap from '@/types/HoverMap'
import { edgeFadeMask, fadingGradient, GradientCache, offscreenLayer } from '@/helpers/Canvas'
import { CompositeOperation } from '@/static/Enums'
import { withAlpha } from '@/helpers/Color'

const ALPHA_DELTA = 0.5

const POINT_MIN_RADIUS = 2

const HIT_RADIUS = 6

const MARKER_RADIUS = 4

const AREA_EDGE_FADE = 12

const AREA_TOP_ALPHA = 0.5

export default class RenderItemLine
    extends RenderItemBase {
    absolute: Point[] = []

    canvas: Point[] = []

    width: number = 1

    dash: number[] = []

    tooltips: string[] = []

    isGradient: boolean = false

    from: Point[] | null = null

    areaBaseline: number | null = null

    private fromAreaBaseline: number | null = null

    private canvasAreaBaseline: number = 0

    private hovered: number = -1

    private readonly gradient = new GradientCache()

    private readonly areaGradient = new GradientCache(fadingGradient)

    private readonly markers = new HoverMap<number>()

    private readonly partialStop: Point = { x: 0, y: 0 }

    current(morph: number = 1): Point[] {
        if (!this.from || morph >= 1 || this.from.length != this.absolute.length)
            return this.absolute.map(stop => ({ x: stop.x, y: stop.y }))

        return this.absolute.map((stop, i) => {
            const from = this.from![i]

            return {
                x: lerp(from.x, stop.x, morph),
                y: lerp(from.y, stop.y, morph)
            }
        })
    }

    private currentAreaBaseline(morph: number = 1): number | null {
        if (this.areaBaseline == null || this.fromAreaBaseline == null || morph >= 1)
            return this.areaBaseline

        return lerp(this.fromAreaBaseline, this.areaBaseline, morph)
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemLine))
            return false

        this.from = previous.current(morph)
        this.fromAreaBaseline = previous.currentAreaBaseline(morph)

        return true
    }

    enterFromAxis(y: number): boolean {
        this.from = this.absolute.map(stop => ({ x: stop.x, y }))

        return true
    }

    leaveToAxis(y: number, morph: number): boolean {
        this.from = this.current(morph)
        this.absolute = this.absolute.map(stop => ({ x: stop.x, y }))

        return true
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const stops = this.from && morph < 1 ? this.current(morph) : this.absolute

        if (this.canvas.length != stops.length)
            this.canvas = stops.map(() => ({ x: 0, y: 0 }))

        for (let i = 0; i < stops.length; i++) {
            this.canvas[i].x = RenderItem.adjustX(window, stops[i].x)
            this.canvas[i].y = RenderItem.adjustY(window, stops[i].y)
        }

        const areaBaseline = this.currentAreaBaseline(morph)

        if (areaBaseline != null)
            this.canvasAreaBaseline = RenderItem.adjustY(window, areaBaseline)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const progress = item.animation.init

        if (this.canvas.length == 0) {
            return
        }

        ctx.lineWidth = this.width
        ctx.setLineDash(this.dash)

        const bounds = this.getBounds()!

        if (this.isGradient && bounds.bottom > bounds.top)
            ctx.fillStyle = ctx.strokeStyle = this.gradient.get(ctx, item.fill!, bounds.top, bounds.bottom)

        const { canvas } = this
        const drawnStopCount = progress < 1 ? this.drawnStopCountAt(progress) : canvas.length
        const partialStop = drawnStopCount < canvas.length ? this.partialStop : null

        if (drawnStopCount == 1 && !partialStop) {
            ctx.arc(canvas[0].x, canvas[0].y, Math.max(this.width, POINT_MIN_RADIUS), 0, FULL_ANGLE)
            ctx.fill()

            return
        }

        const isArea = this.areaBaseline != null

        if (isArea) {
            const lastStop = partialStop ?? canvas[drawnStopCount - 1]

            this.fillArea(ctx, item, bounds, drawnStopCount, partialStop, lastStop)

            ctx.save()
            this.clipToArea(ctx, bounds, lastStop)
        }

        this.traceLine(ctx, drawnStopCount, partialStop)

        ctx.stroke()

        if (isArea)
            ctx.restore()

        if (progress < 1)
            return

        for (const index of this.markers.keys()) {
            const marker = this.canvas[index]
            const radius = (this.width / 2 + MARKER_RADIUS) * this.markers.value(index)

            if (!marker || radius <= 0)
                continue

            ctx.beginPath()
            ctx.arc(marker.x, marker.y, radius, 0, FULL_ANGLE)
            ctx.fill()
        }
    }

    getBounds() {
        if (this.canvas.length == 0) {
            return null
        }

        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity

        for (let i = 0; i < this.canvas.length; i++) {
            const stop = this.canvas[i]

            left = Math.min(left, stop.x)
            top = Math.min(top, stop.y)
            right = Math.max(right, stop.x)
            bottom = Math.max(bottom, stop.y)
        }

        if (this.areaBaseline != null) {
            top = Math.min(top, this.canvasAreaBaseline)
            bottom = Math.max(bottom, this.canvasAreaBaseline)
        }

        const padding = this.width / 2

        return {
            left: left - padding,
            top: top - padding,
            right: right + padding,
            bottom: bottom + padding
        }
    }

    isMouseOver(point: Point): boolean {
        this.hovered = this.stopAt(point)

        return this.hovered >= 0
    }

    tooltipAt(point: Point): string | null {
        if (this.tooltips.length != this.canvas.length)
            return null

        return this.tooltips[this.stopAt(point)] ?? null
    }

    private stopAt(point: Point) {
        let closest = -1
        let distance = this.width / 2 + HIT_RADIUS

        this.canvas.forEach((stop, i) => {
            const current = Math.hypot(point.x - stop.x, point.y - stop.y)

            if (current <= distance) {
                closest = i
                distance = current
            }
        })

        return closest
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp): void {
        if (item.hoverGroup == null)
            return

        item.animation.alpha = 1 - ALPHA_DELTA * item.hoverFactor(isBackward, now, AnimationTiming.hover)
    }

    animateHover(now: DOMHighResTimeStamp): boolean {
        const targets = new Map<number, boolean>()

        for (const index of this.markers.keys())
            if (!this.markers.get(index)!.isIdle)
                targets.set(index, false)

        if (this.hovered >= 0)
            targets.set(this.hovered, true)

        this.markers.update([...targets], now)

        return this.markers.isAnimating
    }

    private fillArea(
        ctx: CanvasRenderingContext2D,
        item: RenderItem,
        { top, bottom }: Bounds,
        drawnStopCount: number,
        partialStop: Point | null,
        lastStop: Point
    ) {
        const { canvas, canvasAreaBaseline } = this
        const left = canvas[0].x
        const right = lastStop.x
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
        this.traceLine(layer, drawnStopCount, partialStop)
        layer.lineTo(right, canvasAreaBaseline)
        layer.lineTo(left, canvasAreaBaseline)
        layer.closePath()

        layer.fillStyle = this.areaGradient.get(layer, withAlpha(item.fill!, AREA_TOP_ALPHA), top, bottom)
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

    private clipToArea(ctx: CanvasRenderingContext2D, { top, bottom }: Bounds, lastStop: Point) {
        const left = this.canvas[0].x

        ctx.rect(left, top, lastStop.x - left, bottom - top)
        ctx.clip()

        ctx.beginPath()
    }

    private traceLine(ctx: CanvasRenderingContext2D, drawnStopCount: number, partialStop: Point | null) {
        const { canvas } = this

        ctx.moveTo(canvas[0].x, canvas[0].y)

        for (let i = 1; i < drawnStopCount; i++) {
            ctx.lineTo(canvas[i].x, canvas[i].y)
        }

        if (partialStop)
            ctx.lineTo(partialStop.x, partialStop.y)
    }

    private drawnStopCountAt(progress: number): number {
        const { canvas } = this

        let total = 0

        for (let i = 1; i < canvas.length; i++)
            total += RenderItemLine.segmentLength(canvas, i)

        let left = total * progress

        for (let i = 1; i < canvas.length; i++) {
            const length = RenderItemLine.segmentLength(canvas, i)

            if (left >= length) {
                left -= length

                continue
            }

            const k = length == 0 ? 0 : left / length
            const from = canvas[i - 1]
            const to = canvas[i]

            this.partialStop.x = from.x + (to.x - from.x) * k
            this.partialStop.y = from.y + (to.y - from.y) * k

            return i
        }

        return canvas.length
    }

    private static segmentLength(stops: Point[], index: number) {
        return Math.hypot(stops[index].x - stops[index - 1].x, stops[index].y - stops[index - 1].y)
    }
}