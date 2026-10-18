import Point from '@/types/Point'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming } from '@/static/constants/Index'

const ALPHA_DELTA = 0.5

export default class RenderItemLine
    extends RenderItemBase {
    absolute: Point[] = []

    canvas: Point[] = []

    width: number = 1

    dash: number[] = []

    from: Point[] | null = null

    current(morph: number = 1): Point[] {
        if (!this.from || morph >= 1 || this.from.length != this.absolute.length)
            return this.absolute.map(stop => ({ x: stop.x, y: stop.y }))

        return this.absolute.map((stop, i) => {
            const from = this.from![i]

            return {
                x: from.x + (stop.x - from.x) * morph,
                y: from.y + (stop.y - from.y) * morph
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
        this.canvas = this.current(morph).map(stop => ({ x: RenderItem.adjustX(window, stop.x), y: RenderItem.adjustY(window, stop.y) }))
    }

    render(ctx: CanvasRenderingContext2D, item?: RenderItem): void {
        const progress = item?.animation.init ?? 1

        if (this.canvas.length == 0 || progress <= 0) {
            return
        }

        ctx.lineWidth = this.width
        ctx.setLineDash(this.dash)

        const stops = progress < 1
                      ? this.partial(progress)
                      : this.canvas

        ctx.moveTo(stops[0].x, stops[0].y)

        for (const stop of stops.slice(1)) {
            ctx.lineTo(stop.x, stop.y)
        }

        ctx.stroke()
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

    animate(item: RenderItem, isBackward: boolean): void {
        item.animation.alpha = 1 - ALPHA_DELTA * item.hoverFactor(isBackward, AnimationTiming.hover)
    }

    isMouseOver(_point: Point): boolean {
        return false
    }

    private partial(progress: number): Point[] {
        const lengths = this.canvas.slice(1).map((stop, i) => {
            return Math.hypot(stop.x - this.canvas[i].x, stop.y - this.canvas[i].y)
        })

        let left = lengths.reduce((acc, length) => { return acc + length }, 0) * progress

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