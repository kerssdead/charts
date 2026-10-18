import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import Alignment, { DEFAULT_ALIGNMENT } from '@/types/Alignment'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import RectangleDimensions from '@/types/RectangleDimensions'
import { GradientCache } from '@/helpers/Canvas'
import { lerp } from '@/helpers/Geometry'

const SCALE_DELTA = 0.01
const ALPHA_DELTA = 0.5

const H_FACTOR = {
    [HorizontalAlignment.Left]: 0,
    [HorizontalAlignment.Center]: 0.5,
    [HorizontalAlignment.Right]: 1
}
const V_FACTOR = {
    [VerticalAlignment.Top]: 0,
    [VerticalAlignment.Center]: 0.5,
    [VerticalAlignment.Bottom]: 1
}

type RectangleCanvas = RectangleDimensions & {
    radii: number[]
}

export default class RenderItemRectangle
    extends RenderItemBase {
    isFill: boolean = false

    isGradient: boolean = false

    radii: number[] = [0, 0, 0, 0]

    fromRadii: number[] | null = null

    absolute: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }

    canvas: RectangleCanvas = { x: 0, y: 0, width: 0, height: 0, radii: [0, 0, 0, 0] }

    align: Alignment = DEFAULT_ALIGNMENT

    growAxis: 'x' | 'y' | null = null

    growOrigin: number = 0

    collapse = { width: true, height: true }

    from: RectangleDimensions | null = null

    private canvasGrowOrigin: number = 0

    private readonly gradient = new GradientCache()

    current(morph: number = 1): RectangleDimensions {
        const result = { ...this.absolute }

        if (!this.from || morph >= 1)
            return result

        result.x = lerp(this.from.x, this.absolute.x, morph)
        result.y = lerp(this.from.y, this.absolute.y, morph)
        result.width = lerp(this.from.width, this.absolute.width, morph)
        result.height = lerp(this.from.height, this.absolute.height, morph)

        return result
    }

    currentRadii(morph: number = 1): number[] {
        if (!this.fromRadii || morph >= 1)
            return [...this.radii]

        const flatten = 1 - Math.pow(1 - morph, 4)
        const round = Math.pow(morph, 4)

        return this.radii.map((radius, i) => {
            const from = this.fromRadii![i] ?? 0

            return lerp(from, radius, radius < from ? flatten : round)
        })
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemRectangle))
            return false

        this.from = previous.current(morph)
        this.fromRadii = previous.currentRadii(morph)

        return true
    }

    appear(mapY?: (y: number) => number): boolean {
        const from = this.current()

        if (mapY)
            from.y = mapY(from.y)

        if (this.collapse.width)
            from.width = 0

        if (this.collapse.height)
            from.height = 0

        this.from = from

        return true
    }

    disappear(morph: number, mapY?: (y: number) => number): boolean {
        this.from = this.current(morph)

        if (mapY)
            this.absolute.y = mapY(this.from.y)

        if (this.collapse.width)
            this.absolute.width = 0

        if (this.collapse.height)
            this.absolute.height = 0

        return true
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const absolute = this.current(morph)

        this.canvas.radii = this.currentRadii(morph).map(radius => radius / COORDS_MAX_X * window.width)

        this.canvas.x = RenderItem.adjustX(window, absolute.x)
        this.canvas.y = RenderItem.adjustY(window, absolute.y)
        this.canvas.width = absolute.width / COORDS_MAX_X * window.width
        this.canvas.height = absolute.height / COORDS_MAX_Y * window.height

        this.canvasGrowOrigin = this.growAxis == 'x'
                                ? RenderItem.adjustX(window, this.growOrigin)
                                : RenderItem.adjustY(window, this.growOrigin)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const { left, top, width, height } = this.grow(item.animation.init)

        ctx.roundRect(left, top, width, height, this.canvas.radii)

        if (this.isGradient && height != 0) {
            ctx.fillStyle = ctx.strokeStyle = this.gradient.get(ctx, item.color, top, top + height)
        }

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()
    }

    getBounds() {
        const { left, top, width, height } = this.bounds()

        return {
            left: Math.min(left, left + width),
            top: Math.min(top, top + height),
            right: Math.max(left, left + width),
            bottom: Math.max(top, top + height)
        }
    }

    isMouseOver(point: Point) {
        const { left, top, width, height } = this.bounds()

        return left <= point.x && point.x <= left + width
               && top <= point.y && point.y <= top + height
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) {
        const k = item.hoverFactor(isBackward, now, AnimationTiming.hover)

        item.animation.scale = 1 - SCALE_DELTA * k
        item.animation.alpha = 1 - ALPHA_DELTA * k
    }

    private grow(progress: number) {
        if (progress >= 1) {
            return this.bounds()
        }

        if (this.growAxis == null) {
            return this.bounds(progress)
        }

        const bounds = this.bounds()
        const origin = this.canvasGrowOrigin

        if (this.growAxis == 'x') {
            return {
                ...bounds,
                left: lerp(origin, bounds.left, progress),
                width: bounds.width * progress
            }
        }

        return {
            ...bounds,
            top: lerp(origin, bounds.top, progress),
            height: bounds.height * progress
        }
    }

    private bounds(scale = 1) {
        const width = this.canvas.width * scale
        const height = this.canvas.height * scale

        return {
            left: this.canvas.x - width * H_FACTOR[this.align.x],
            top: this.canvas.y - height * V_FACTOR[this.align.y],
            width,
            height,
        }
    }
}