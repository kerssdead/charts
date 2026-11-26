import Point from '@/types/Point'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, FULL_ANGLE } from '@/static/constants/Index'
import { lerp } from '@/helpers/Geometry'
import PointHelper from '@/helpers/PointHelper'
import Rectangle from '@/helpers/Rectangle'
import { GradientCache } from '@/helpers/Canvas'
import { LineJoin } from '@/static/Enums'
import { Tooltip, resolveTooltip } from '@/types/Tooltip'
import RectangleDimensions from '@/types/RectangleDimensions'
import LinePathTracer from '@/helpers/LinePathTracer'
import LineArea, { LinePath } from '@/helpers/LineArea'
import LineMarkers from '@/helpers/LineMarkers'
import { strokeLinePath } from '@/helpers/LineStroke'
import { getLineBounds, mapLineStops } from '@/helpers/LineGeometry'

const ALPHA_DELTA = 0.5

const POINT_MIN_RADIUS = 2

const HIT_RADIUS = 6

export default class RenderItemLine extends RenderItemBase {
    absolute: Point[] = []

    canvas: Point[] = []

    width = 1

    dash: number[] = []

    pathTracer = new LinePathTracer()

    tooltips: Tooltip[] = []

    isGradient = false

    from: Point[] | null = null

    readonly area = new LineArea()

    clip: RectangleDimensions | null = null

    private fromClip: RectangleDimensions | null = null

    private readonly canvasClip = Rectangle.empty()

    private isSortedX = true

    private adjustedWindow: RectangleDimensions | null = null

    private cachedBounds: Bounds | null = null

    private isBoundsCached = false

    private readonly gradient = new GradientCache()

    private readonly markers = new LineMarkers()

    current(morph = 1): Point[] {
        const from = this.from

        if (!from || morph >= 1 || from.length !== this.absolute.length)
            return this.absolute.map(stop => ({ x: stop.x, y: stop.y }))

        return this.absolute.map((stop, i) => {
            return {
                x: lerp(from[i].x, stop.x, morph),
                y: lerp(from[i].y, stop.y, morph)
            }
        })
    }

    private currentClip(morph = 1): RectangleDimensions | null {
        if (!this.clip || !this.fromClip || morph >= 1)
            return this.clip

        return Rectangle.lerp(this.fromClip, this.clip, morph)
    }

    morphFrom(previous: RenderItemBase, morph: number) {
        if (!(previous instanceof RenderItemLine))
            return false

        this.from = previous.current(morph)
        this.area.morphFrom(previous.area, morph)
        this.fromClip = previous.currentClip(morph)
        this.invalidateAdjust()

        return true
    }

    enterFromAxis(y: number) {
        this.from = this.absolute.map(stop => ({ x: stop.x, y }))
        this.invalidateAdjust()

        return true
    }

    leaveToAxis(y: number, morph: number) {
        this.from = this.current(morph)
        this.absolute = this.absolute.map(stop => ({ x: stop.x, y }))
        this.invalidateAdjust()

        return true
    }

    adjust(window: CanvasWindow, morph = 1) {
        if (morph >= 1 && this.isAdjusted(window))
            return

        const stops = this.from && morph < 1 ? this.current(morph) : this.absolute
        const { canvas, isSortedX } = mapLineStops(window, stops, this.canvas)

        this.canvas = canvas
        this.isSortedX = isSortedX

        this.pathTracer.updateCurve(this.canvas, morph < 1)

        this.area.adjust(window, morph)

        const clip = this.currentClip(morph)

        if (clip) {
            window.mapBox(clip, this.canvasClip)
        }

        this.adjustedWindow = morph >= 1 ? Rectangle.copy(window) : null
        this.isBoundsCached = false
    }

    private isAdjusted(window: CanvasWindow) {
        return this.adjustedWindow != null && Rectangle.same(this.adjustedWindow, window)
    }

    private invalidateAdjust() {
        this.adjustedWindow = null
        this.isBoundsCached = false
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem) {
        const bounds = this.getBounds()

        if (!bounds)
            return

        if (!this.clip) {
            this.renderLine(ctx, item, bounds)

            return
        }

        ctx.save()

        this.clipToBox(ctx)
        this.renderLine(ctx, item, bounds)

        ctx.restore()
    }

    private renderLine(ctx: CanvasRenderingContext2D, item: RenderItem, bounds: Bounds) {
        const progress = item.animation.init
        const fill = item.fill

        this.applyStyle(ctx, fill, bounds)

        const { canvas, pathTracer } = this
        const drawnStopCount = progress < 1 ? pathTracer.placeProgress(canvas, progress) : canvas.length
        const hasPartialStop = drawnStopCount < canvas.length

        if (drawnStopCount === 1 && !hasPartialStop) {
            ctx.arc(canvas[0].x, canvas[0].y, Math.max(this.width, POINT_MIN_RADIUS), 0, FULL_ANGLE)
            ctx.fill()

            return
        }

        const path: LinePath = {
            left: canvas[0].x,
            right: (hasPartialStop ? pathTracer.partialStop : canvas[drawnStopCount - 1]).x,
            lastPointIndex: hasPartialStop ? drawnStopCount : drawnStopCount - 1,
            trace: target => pathTracer.trace(target, canvas, drawnStopCount, hasPartialStop),
            traceSlice: (target, slice) => pathTracer.traceSlice(target, canvas, drawnStopCount, slice)
        }

        if (this.area.baseline == null)
            strokeLinePath(ctx, path)
        else
            this.renderArea(ctx, fill, bounds, path)

        if (progress >= 1)
            this.markers.render(ctx, canvas, this.width)
    }

    private applyStyle(ctx: CanvasRenderingContext2D, fill: string | undefined, bounds: Bounds) {
        ctx.lineWidth = this.width
        ctx.lineJoin = LineJoin.Round
        ctx.setLineDash(this.dash)

        if (this.isGradient && fill && bounds.bottom > bounds.top)
            ctx.fillStyle = ctx.strokeStyle = this.gradient.get(ctx, fill, bounds.top, bounds.bottom)
    }

    private renderArea(ctx: CanvasRenderingContext2D, fill: string | undefined, bounds: Bounds, path: LinePath) {
        if (fill)
            this.area.fill(ctx, fill, bounds, path)

        ctx.save()
        this.area.clip(ctx, bounds, path)
        strokeLinePath(ctx, path)
        ctx.restore()
    }

    getBounds() {
        if (!this.isBoundsCached) {
            this.cachedBounds = getLineBounds(
                this.canvas,
                this.width / 2,
                this.area.baseline != null ? this.area.canvasBaseline : null
            )
            this.isBoundsCached = true
        }

        return this.cachedBounds
    }

    isMouseOver(point: Point) {
        return this.stopAt(point) >= 0
    }

    tooltipAt(point: Point): string | null {
        if (this.tooltips.length !== this.canvas.length)
            return null

        return resolveTooltip(this.tooltips[this.stopAt(point)] ?? null)
    }

    tooltipDistanceAt(point: Point): number | null {
        const stop = this.canvas[this.stopAt(point)]

        return stop ? Math.hypot(point.x - stop.x, point.y - stop.y) : null
    }

    private isInsideClip(stop: Point) {
        return !this.clip || Rectangle.contains(this.canvasClip, stop)
    }

    private stopAt(point: Point) {
        return PointHelper.findClosestStop(
            this.canvas,
            point,
            this.width / 2 + HIT_RADIUS,
            { isSortedX: this.isSortedX, isInside: stop => this.isInsideClip(stop) }
        )
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) {
        if (item.hoverGroup == null)
            return

        item.animation.alpha = 1 - ALPHA_DELTA * item.hoverFactor(isBackward, now, AnimationTiming.hover)
    }

    animateHover(point: Point | null, now: DOMHighResTimeStamp, isInstant = false) {
        const hovered = point ? this.stopAt(point) : -1

        return this.markers.animate(hovered, now, isInstant)
    }

    private clipToBox(ctx: CanvasRenderingContext2D) {
        const { x, y, width, height } = this.canvasClip

        ctx.rect(x, y, width, height)
        ctx.clip()

        ctx.beginPath()
    }
}