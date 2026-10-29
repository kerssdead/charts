import Point from '@/types/Point'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, FULL_ANGLE } from '@/static/constants/Index'
import { lerp } from '@/helpers/Geometry'
import HoverMap from '@/types/HoverMap'
import { GradientCache } from '@/helpers/Canvas'

const ALPHA_DELTA = 0.5

const POINT_MIN_RADIUS = 2

const HIT_RADIUS = 6

const MARKER_RADIUS = 4

export default class RenderItemLine
    extends RenderItemBase {
    absolute: Point[] = []

    canvas: Point[] = []

    width: number = 1

    dash: number[] = []

    tooltips: string[] = []

    isGradient: boolean = false

    from: Point[] | null = null

    private hovered: number = -1

    private readonly gradient = new GradientCache()

    private readonly markers = new HoverMap<number>()

    private readonly partialEnd: Point = { x: 0, y: 0 }

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

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemLine))
            return false

        this.from = previous.current(morph)

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
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const progress = item.animation.init

        if (this.canvas.length == 0) {
            return
        }

        ctx.lineWidth = this.width
        ctx.setLineDash(this.dash)

        if (this.isGradient) {
            const bounds = this.getBounds()!

            if (bounds.bottom > bounds.top)
                ctx.fillStyle = ctx.strokeStyle = this.gradient.get(ctx, item.fill!, bounds.top, bounds.bottom)
        }

        const { canvas } = this
        const whole = progress < 1 ? this.wholeStopsAt(progress) : canvas.length
        const end = whole < canvas.length ? this.partialEnd : null

        if (whole == 1 && !end) {
            ctx.arc(canvas[0].x, canvas[0].y, Math.max(this.width, POINT_MIN_RADIUS), 0, FULL_ANGLE)
            ctx.fill()

            return
        }

        ctx.moveTo(canvas[0].x, canvas[0].y)

        for (let i = 1; i < whole; i++) {
            ctx.lineTo(canvas[i].x, canvas[i].y)
        }

        if (end)
            ctx.lineTo(end.x, end.y)

        ctx.stroke()

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

    private wholeStopsAt(progress: number): number {
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

            this.partialEnd.x = from.x + (to.x - from.x) * k
            this.partialEnd.y = from.y + (to.y - from.y) * k

            return i
        }

        return canvas.length
    }

    private static segmentLength(stops: Point[], index: number) {
        return Math.hypot(stops[index].x - stops[index - 1].x, stops[index].y - stops[index - 1].y)
    }
}