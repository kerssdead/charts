import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import Alignment, { DEFAULT_ALIGNMENT } from '@/types/Alignment'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import RectangleDimensions from '@/types/RectangleDimensions'
import { unitVerticalGradient } from '@/helpers/Canvas'
import { clamp, lerp } from '@/helpers/Geometry'

const SCALE_DELTA = 0.01
const ALPHA_DELTA = 0.5

const horizontalFactor = (x: HorizontalAlignment) => x == HorizontalAlignment.Left ? 0 : x == HorizontalAlignment.Center ? .5 : 1

const verticalFactor = (y: VerticalAlignment) => y == VerticalAlignment.Top ? 0 : y == VerticalAlignment.Center ? .5 : 1

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

    clip: ClipBox | null = null

    fromClip: ClipBox | null = null

    private readonly canvasClip: ClipBox = { x: 0, y: 0, width: 0, height: 0, radius: 0 }

    private canvasGrowOrigin: number = 0

    private readonly position: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }

    private readonly area: CanvasBox = { left: 0, top: 0, width: 0, height: 0 }

    private readonly grownArea: CanvasBox = { left: 0, top: 0, width: 0, height: 0 }

    private readonly edges: Bounds = { left: 0, top: 0, right: 0, bottom: 0 }

    current(morph: number = 1, result: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }): RectangleDimensions {
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
            x: lerp(this.fromClip.x, this.clip.x, morph),
            y: lerp(this.fromClip.y, this.clip.y, morph),
            width: lerp(this.fromClip.width, this.clip.width, morph),
            height: lerp(this.fromClip.height, this.clip.height, morph),
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

        this.canvas.x = RenderItem.adjustX(window, absolute.x)
        this.canvas.y = RenderItem.adjustY(window, absolute.y)
        this.canvas.width = absolute.width / COORDS_MAX_X * window.width
        this.canvas.height = absolute.height / COORDS_MAX_Y * window.height

        const clip = this.currentClip(morph)

        if (clip) {
            this.canvasClip.x = RenderItem.adjustX(window, clip.x)
            this.canvasClip.y = RenderItem.adjustY(window, clip.y)
            this.canvasClip.width = clip.width / COORDS_MAX_X * window.width
            this.canvasClip.height = clip.height / COORDS_MAX_Y * window.height
            this.canvasClip.radius = clip.radius / COORDS_MAX_X * window.width
        }

        this.canvasGrowOrigin = this.growAxis == 'x'
                                ? RenderItem.adjustX(window, this.growOrigin)
                                : RenderItem.adjustY(window, this.growOrigin)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const { left, top, width, height } = this.grow(item.animation.init)

        if (width == 0 || height == 0)
            return

        if (this.clip) {
            const clip = this.canvasClip

            ctx.save()

            ctx.roundRect(clip.x, clip.y, clip.width, clip.height, clip.radius)
            ctx.clip()

            ctx.beginPath()
        }

        ctx.roundRect(left, top, width, height, this.canvas.radii)

        if (this.isGradient) {
            const scale = Math.abs(height)

            ctx.save()

            ctx.translate(0, Math.min(top, top + height))
            ctx.scale(scale, scale)

            ctx.lineWidth /= scale
            ctx.fillStyle = ctx.strokeStyle = unitVerticalGradient(ctx, item.fill!)
        }

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()

        if (this.isGradient)
            ctx.restore()

        if (this.clip)
            ctx.restore()
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
               && (!this.clip || this.isInClip(point))
    }

    private isInClip(point: Point) {
        const { x, y, width, height } = this.canvasClip
        const radius = Math.min(this.canvasClip.radius, width / 2, height / 2)

        const dx = point.x - clamp(point.x, x + radius, x + width - radius)
        const dy = point.y - clamp(point.y, y + radius, y + height - radius)

        return dx * dx + dy * dy <= radius * radius
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) {
        const k = item.hoverFactor(isBackward, now, AnimationTiming.hover)

        item.animation.scale = 1 - SCALE_DELTA * k
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
        const isX = this.growAxis == 'x'

        grown.left = isX ? lerp(origin, area.left, progress) : area.left
        grown.top = isX ? area.top : lerp(origin, area.top, progress)
        grown.width = isX ? area.width * progress : area.width
        grown.height = isX ? area.height : area.height * progress

        return grown
    }

    private bounds(scale: number, result: CanvasBox) {
        const width = this.canvas.width * scale
        const height = this.canvas.height * scale

        result.left = this.canvas.x - width * horizontalFactor(this.align.x)
        result.top = this.canvas.y - height * verticalFactor(this.align.y)
        result.width = width
        result.height = height

        return result
    }
}