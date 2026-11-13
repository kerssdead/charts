import Point from '@/types/Point'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, FULL_ANGLE } from '@/static/constants/Index'
import { contains, lerp, lerpRect } from '@/helpers/Geometry'
import { GradientCache } from '@/helpers/Canvas'
import { LineJoin } from '@/static/Enums'
import RectangleDimensions from '@/types/RectangleDimensions'
import LinePathTracer from '@/render/LinePathTracer'
import LineArea, { LinePath } from '@/render/LineArea'
import LineMarkers from '@/render/LineMarkers'

const ALPHA_DELTA = 0.5

const POINT_MIN_RADIUS = 2

const HIT_RADIUS = 6

export default class RenderItemLine extends RenderItemBase {
    absolute: Point[] = []

    canvas: Point[] = []

    width: number = 1

    dash: number[] = []

    pathTracer = new LinePathTracer()

    tooltips: string[] = []

    isGradient: boolean = false

    from: Point[] | null = null

    readonly area = new LineArea()

    clip: RectangleDimensions | null = null

    private fromClip: RectangleDimensions | null = null

    private readonly canvasClip: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }

    private hovered: number = -1

    private readonly gradient = new GradientCache()

    private readonly markers = new LineMarkers()

    current(morph: number = 1): Point[] {
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

    private currentClip(morph: number = 1): RectangleDimensions | null {
        if (!this.clip || !this.fromClip || morph >= 1)
            return this.clip

        return lerpRect(this.fromClip, this.clip, morph)
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemLine))
            return false

        this.from = previous.current(morph)
        this.area.morphFrom(previous.area, morph)
        this.fromClip = previous.currentClip(morph)

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

        if (this.canvas.length !== stops.length)
            this.canvas = stops.map(() => ({ x: 0, y: 0 }))

        for (let i = 0; i < stops.length; i++) {
            this.canvas[i].x = RenderItem.adjustX(window, stops[i].x)
            this.canvas[i].y = RenderItem.adjustY(window, stops[i].y)
        }

        this.pathTracer.updateCurve(this.canvas)

        this.area.adjust(window, morph)

        const clip = this.currentClip(morph)

        if (clip) {
            this.canvasClip.x = RenderItem.adjustX(window, clip.x)
            this.canvasClip.y = RenderItem.adjustY(window, clip.y)
            this.canvasClip.width = clip.width / COORDS_MAX_X * window.width
            this.canvasClip.height = clip.height / COORDS_MAX_Y * window.height
        }
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
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
            trace: target => pathTracer.trace(target, canvas, drawnStopCount, hasPartialStop)
        }

        if (this.area.baseline == null)
            this.strokePath(ctx, path)
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

    private strokePath(ctx: CanvasRenderingContext2D, path: LinePath) {
        path.trace(ctx)

        ctx.stroke()
    }

    private renderArea(ctx: CanvasRenderingContext2D, fill: string | undefined, bounds: Bounds, path: LinePath) {
        if (fill)
            this.area.fill(ctx, fill, bounds, path)

        ctx.save()
        this.area.clip(ctx, bounds, path)
        this.strokePath(ctx, path)
        ctx.restore()
    }

    getBounds() {
        if (this.canvas.length === 0) {
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

        if (this.area.baseline != null) {
            top = Math.min(top, this.area.canvasBaseline)
            bottom = Math.max(bottom, this.area.canvasBaseline)
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
        if (this.tooltips.length !== this.canvas.length)
            return null

        return this.tooltips[this.stopAt(point)] ?? null
    }

    private stopAt(point: Point) {
        let closest = -1
        let distance = this.width / 2 + HIT_RADIUS

        this.canvas.forEach((stop, i) => {
            if (!this.isInsideClip(stop))
                return

            const current = Math.hypot(point.x - stop.x, point.y - stop.y)

            if (current <= distance) {
                closest = i
                distance = current
            }
        })

        return closest
    }

    private isInsideClip(stop: Point) {
        return !this.clip || contains(this.canvasClip, stop)
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp): void {
        if (item.hoverGroup == null)
            return

        item.animation.alpha = 1 - ALPHA_DELTA * item.hoverFactor(isBackward, now, AnimationTiming.hover)
    }

    animateHover(now: DOMHighResTimeStamp): boolean {
        return this.markers.animate(this.hovered, now)
    }

    private clipToBox(ctx: CanvasRenderingContext2D) {
        const { x, y, width, height } = this.canvasClip

        ctx.rect(x, y, width, height)
        ctx.clip()

        ctx.beginPath()
    }
}