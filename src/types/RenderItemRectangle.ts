import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import Alignment, { DEFAULT_ALIGNMENT } from '@/types/Alignment'
import { HorizontalAlignment, VerticalAlignment, Axis, FadeEdge } from '@/static/Enums'
import RectangleDimensions from '@/types/RectangleDimensions'
import RectangleGradient from '@/helpers/RectangleGradient'
import { lerp } from '@/helpers/Geometry'
import Rectangle from '@/helpers/Rectangle'
import { capFadeGradient } from '@/helpers/Canvas'

const ALPHA_DELTA = 0.5

const HORIZONTAL_FACTOR = {
    [HorizontalAlignment.Left]: 0,
    [HorizontalAlignment.Center]: .5,
    [HorizontalAlignment.Right]: 1,
}

const VERTICAL_FACTOR = {
    [VerticalAlignment.Top]: 0,
    [VerticalAlignment.Center]: .5,
    [VerticalAlignment.Bottom]: 1
}

type RectangleCanvas = RectangleDimensions & {
    radii: number[]
}

type ClipBox = RectangleDimensions & {
    radius: number
}

type CanvasBox = {
    left: number
    top: number
    width: number
    height: number
}

export default class RenderItemRectangle extends RenderItemBase {
    isFill: boolean = false

    isGradient: boolean = false

    fadeEdge: FadeEdge | null = null

    radii: number[] = [0, 0, 0, 0]

    fromRadii: number[] | null = null

    absolute: RectangleDimensions = Rectangle.empty()

    canvas: RectangleCanvas = { ...Rectangle.empty(), radii: [0, 0, 0, 0] }

    align: Alignment = DEFAULT_ALIGNMENT

    growAxis: Axis | null = null

    growOrigin: number = 0

    collapse = { width: true, height: true }

    from: RectangleDimensions | null = null

    clip: ClipBox | null = null

    fromClip: ClipBox | null = null

    private readonly canvasClip: ClipBox = { ...Rectangle.empty(), radius: 0 }

    private canvasGrowOrigin: number = 0

    private readonly position = Rectangle.empty()

    private readonly area: CanvasBox = { left: 0, top: 0, width: 0, height: 0 }

    private readonly grownArea: CanvasBox = { left: 0, top: 0, width: 0, height: 0 }

    private readonly edges: Bounds = { left: 0, top: 0, right: 0, bottom: 0 }

    private readonly gradient = new RectangleGradient()

    current(
        morph: number = 1,
        result: RectangleDimensions = Rectangle.empty()
    ): RectangleDimensions {
        const { absolute } = this
        const from = this.from && morph < 1 ? this.from : null

        result.x = from ? lerp(from.x, absolute.x, morph) : absolute.x
        result.y = from ? lerp(from.y, absolute.y, morph) : absolute.y
        result.width = from ? lerp(from.width, absolute.width, morph) : absolute.width
        result.height = from ? lerp(from.height, absolute.height, morph) : absolute.height

        return result
    }

    currentRadii(morph: number = 1, result: number[] = []): number[] {
        const isMorphing = this.fromRadii != null && morph < 1
        const flatten = 1 - Math.pow(1 - morph, 4)
        const round = Math.pow(morph, 4)

        result.length = this.radii.length

        for (let i = 0; i < this.radii.length; i++) {
            const radius = this.radii[i]
            const from = this.fromRadii?.[i] ?? 0

            result[i] = isMorphing ? lerp(from, radius, radius < from ? flatten : round) : radius
        }

        return result
    }

    currentClip(morph: number = 1): ClipBox | null {
        if (!this.clip || !this.fromClip || morph >= 1)
            return this.clip

        return {
            ...Rectangle.lerp(this.fromClip, this.clip, morph),
            radius: lerp(this.fromClip.radius, this.clip.radius, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemRectangle))
            return false

        this.from = previous.current(morph)
        this.fromRadii = previous.currentRadii(morph)
        this.fromClip = previous.currentClip(morph)

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
        const absolute = this.current(morph, this.position)
        const radii = this.currentRadii(morph, this.canvas.radii)

        for (let i = 0; i < radii.length; i++)
            radii[i] = radii[i] / COORDS_MAX_X * window.width

        this.canvas.x = window.mapX(absolute.x)
        this.canvas.y = window.mapY(absolute.y)
        this.canvas.width = absolute.width / COORDS_MAX_X * window.width
        this.canvas.height = absolute.height / COORDS_MAX_Y * window.height

        const clip = this.currentClip(morph)

        if (clip) {
            this.canvasClip.x = window.mapX(clip.x)
            this.canvasClip.y = window.mapY(clip.y)
            this.canvasClip.width = clip.width / COORDS_MAX_X * window.width
            this.canvasClip.height = clip.height / COORDS_MAX_Y * window.height
            this.canvasClip.radius = clip.radius / COORDS_MAX_X * window.width
        }

        this.canvasGrowOrigin = this.growAxis === Axis.X
                                ? window.mapX(this.growOrigin)
                                : window.mapY(this.growOrigin)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const { left, top, width, height } = this.grow(item.animation.init)

        if (width === 0 || height === 0)
            return

        if (this.clip) {
            const clip = this.canvasClip

            ctx.save()

            ctx.roundRect(clip.x, clip.y, clip.width, clip.height, clip.radius)
            ctx.clip()

            ctx.beginPath()
        }

        ctx.roundRect(left, top, width, height, this.canvas.radii)

        if (this.fadeEdge && item.fill) {
            ctx.fillStyle = capFadeGradient(ctx, item.fill, this.fadeEdge, { x: left, y: top, width, height })
            ctx.fill()
        } else {
            this.paint(ctx, item, top, height)
        }

        if (this.clip)
            ctx.restore()
    }

    private paint(ctx: CanvasRenderingContext2D, item: RenderItem, top: number, height: number) {
        const gradientFill = this.isGradient ? item.fill : undefined

        if (gradientFill)
            this.gradient.apply(ctx, gradientFill, top, height)

        if (this.isFill)
            ctx.fill()

        ctx.stroke()

        this.gradient.restore(ctx)
    }

    getBounds() {
        const { left, top, width, height } = this.bounds(1, this.area)

        this.edges.left = Math.min(left, left + width)
        this.edges.top = Math.min(top, top + height)
        this.edges.right = Math.max(left, left + width)
        this.edges.bottom = Math.max(top, top + height)

        return this.edges
    }

    isMouseOver(point: Point) {
        const { left, top, right, bottom } = this.getBounds()

        return left <= point.x && point.x <= right
               && top <= point.y && point.y <= bottom
               && (!this.clip || Rectangle.containsRounded(this.canvasClip, this.canvasClip.radius, point))
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) {
        const k = item.hoverFactor(isBackward, now, AnimationTiming.hover)

        item.animation.alpha = 1 - ALPHA_DELTA * k
    }

    private grow(progress: number) {
        if (progress >= 1) {
            return this.bounds(1, this.area)
        }

        if (this.growAxis == null) {
            return this.bounds(progress, this.grownArea)
        }

        const area = this.bounds(1, this.area)
        const grown = this.grownArea
        const origin = this.canvasGrowOrigin
        const isX = this.growAxis === Axis.X

        grown.left = isX ? lerp(origin, area.left, progress) : area.left
        grown.top = isX ? area.top : lerp(origin, area.top, progress)
        grown.width = isX ? area.width * progress : area.width
        grown.height = isX ? area.height : area.height * progress

        return grown
    }

    private bounds(scale: number, result: CanvasBox) {
        const width = this.canvas.width * scale
        const height = this.canvas.height * scale

        result.left = this.canvas.x - width * HORIZONTAL_FACTOR[this.align.x]
        result.top = this.canvas.y - height * VERTICAL_FACTOR[this.align.y]
        result.width = width
        result.height = height

        return result
    }
}