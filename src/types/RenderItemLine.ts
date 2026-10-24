import Point from '@/types/Point'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming } from '@/static/constants/Index'
import { lerp } from '@/helpers/Geometry'
import { sum } from '@/helpers/Collections'
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

        const stops = progress < 1
                      ? this.partial(progress)
                      : this.canvas

        if (stops.length == 1) {
            ctx.arc(stops[0].x, stops[0].y, Math.max(this.width, POINT_MIN_RADIUS), 0, Math.PI * 2)
            ctx.fill()

            return
        }

        ctx.moveTo(stops[0].x, stops[0].y)

        for (let i = 1; i < stops.length; i++) {
            ctx.lineTo(stops[i].x, stops[i].y)
        }

        ctx.stroke()

        if (progress < 1)
            return

        for (const index of this.markers.keys()) {
            const marker = this.canvas[index]
            const radius = (this.width / 2 + MARKER_RADIUS) * this.markers.value(index)

            if (!marker || radius <= 0)
                continue

            ctx.beginPath()
            ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2)
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

        for (const stop of this.canvas) {
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

    private partial(progress: number): Point[] {
        const lengths = this.canvas.slice(1).map((stop, i) => Math.hypot(stop.x - this.canvas[i].x, stop.y - this.canvas[i].y))

        let left = sum(lengths, length => length) * progress

        const result: Point[] = [this.canvas[0]]

        for (let i = 0; i < lengths.length; i++) {
            const from = this.canvas[i]
            const to = this.canvas[i + 1]

            if (left >= lengths[i]) {
                result.push(to)
                left -= lengths[i]

                continue
            }

            const k = lengths[i] == 0 ? 0 : left / lengths[i]

            result.push({
                x: from.x + (to.x - from.x) * k,
                y: from.y + (to.y - from.y) * k
            })

            break
        }

        return result
    }
}