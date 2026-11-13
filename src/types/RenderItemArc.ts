import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, COORDS_MAX_X, FULL_ANGLE } from '@/static/constants/Index'
import Point from '@/types/Point'
import Theme from '@/Theme'
import { GradientCache } from '@/helpers/Canvas'
import { clamp, lerp } from '@/helpers/Geometry'
import type RenderItemText from '@/types/RenderItemText'
import { ArcShape, isFullCircle, isInsideSector, traceSector } from '@/render/ArcSector'

export const HOVER_OFFSET = 8

const ALPHA_DELTA = 0.5

type ArcGeometry = {
    x: number
    y: number
    radius: number
    innerRadius: number
    startAngle: number
    endAngle: number
    pull: number
    leaderOffset: number
    leaderAnchor: number
}

type ArcCanvas = ArcGeometry & {
    gap: number
    cornerRadius: number
    leaderGap: number
    leaderLength: number
}

export default class RenderItemArc extends RenderItemBase {
    isFill: boolean = false

    isGradient: boolean = false

    absolute: Point = { x: 0, y: 0 }

    radius: number = 10

    innerRadius: number = 0

    gap: number = 0

    cornerRadius: number = 0

    growOrigin: number | null = null

    leaderGap: number = 0

    leaderLength: number = 0

    leaderOffset: number = 0

    leaderAnchor: number = 0

    leaderLabel: RenderItem | null = null

    hover: number = 0

    pull: number = 0

    readonly pop: Point = { x: 0, y: 0 }

    private readonly gradient = new GradientCache()

    private window!: CanvasWindow

    startAngle: number = 0

    endAngle: number = FULL_ANGLE

    from: ArcGeometry | null = null

    canvas: ArcCanvas = {
        ...this.current(),
        gap: this.gap,
        cornerRadius: this.cornerRadius,
        leaderGap: this.leaderGap,
        leaderLength: this.leaderLength
    }

    current(morph: number = 1): ArcGeometry {
        const result = {
            x: this.absolute.x,
            y: this.absolute.y,
            radius: this.radius,
            innerRadius: this.innerRadius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            pull: this.pull,
            leaderOffset: this.leaderOffset,
            leaderAnchor: this.leaderAnchor
        }

        if (!this.from || morph >= 1)
            return result

        return {
            x: lerp(this.from.x, result.x, morph),
            y: lerp(this.from.y, result.y, morph),
            radius: lerp(this.from.radius, result.radius, morph),
            innerRadius: lerp(this.from.innerRadius, result.innerRadius, morph),
            startAngle: lerp(this.from.startAngle, result.startAngle, morph),
            endAngle: lerp(this.from.endAngle, result.endAngle, morph),
            pull: lerp(this.from.pull, result.pull, morph),
            leaderOffset: lerp(this.from.leaderOffset, result.leaderOffset, morph),
            leaderAnchor: lerp(this.from.leaderAnchor, result.leaderAnchor, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemArc))
            return false

        this.from = previous.current(morph)

        return true
    }

    appearFromAngle(angle: number) {
        this.from = Object.assign(this.current(), { startAngle: angle, endAngle: angle })
    }

    disappearToAngle(angle: number, morph: number) {
        this.from = this.current(morph)
        this.startAngle = angle
        this.endAngle = angle
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const geometry = this.current(morph)
        const scale = window.width / COORDS_MAX_X

        this.window = window

        this.canvas = {
            x: RenderItem.adjustX(window, geometry.x),
            y: RenderItem.adjustY(window, geometry.y),
            radius: geometry.radius * scale,
            innerRadius: geometry.innerRadius * scale,
            gap: this.gap * scale,
            cornerRadius: this.cornerRadius * scale,
            leaderGap: this.leaderGap * scale,
            leaderLength: this.leaderLength * scale,
            startAngle: geometry.startAngle,
            endAngle: geometry.endAngle,
            pull: geometry.pull * scale,
            leaderOffset: geometry.leaderOffset,
            leaderAnchor: geometry.leaderAnchor
        }
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem): void {
        const shape = this.shape(item.animation.init)
        const fill = item.fill

        if (this.isGradient && fill)
            ctx.fillStyle = ctx.strokeStyle = this.gradient.get(
                ctx,
                fill,
                shape.y - this.canvas.radius,
                shape.y + this.canvas.radius
            )

        if (isFullCircle(shape.end - shape.start))
            this.circle(ctx, shape)
        else if (!traceSector(ctx, shape, this.canvas))
            return

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()

        this.leader(ctx, shape)
    }

    private shape(progress: number): ArcShape {
        let start = this.canvas.startAngle
        let end = this.canvas.endAngle

        if (this.growOrigin != null && progress < 1) {
            start = lerp(this.growOrigin, start, progress)
            end = lerp(this.growOrigin, end, progress)
        }

        const middle = (start + end) / 2
        const offset = isFullCircle(end - start) ? 0 : this.canvas.pull + HOVER_OFFSET * this.hover

        this.pop.x = offset * Math.cos(middle)
        this.pop.y = offset * Math.sin(middle)

        return { x: this.canvas.x + this.pop.x, y: this.canvas.y + this.pop.y, start, end, middle }
    }

    private leader(ctx: CanvasRenderingContext2D, shape: ArcShape) {
        const label = this.leaderLabel
        const visibility = label?.animation.visibility ?? 0

        if (!label || visibility <= 0)
            return

        const anchorAngle = shape.middle + this.canvas.leaderAnchor
        const turn = this.canvas.leaderOffset - this.canvas.leaderAnchor
        const labelAngle = anchorAngle + turn

        const hover = isFullCircle(shape.end - shape.start) ? 0 : HOVER_OFFSET * this.hover
        const x = shape.x - hover * Math.cos(shape.middle)
        const y = shape.y - hover * Math.sin(shape.middle)
        const start = this.canvas.radius + this.canvas.leaderGap
        const end = start + this.canvas.leaderLength
        const lift = start + hover
        const handle = 4 / 3 * Math.tan(turn / 4) * end

        ctx.globalAlpha *= visibility
        ctx.strokeStyle = Theme.line

        const endX = x + end * Math.cos(labelAngle)
        const endY = y + end * Math.sin(labelAngle)

        label.shape.adjust(this.window, label.animation.morph)

        const box = (label.shape as RenderItemText).orbitBox()

        ctx.beginPath()
        ctx.moveTo(x + lift * Math.cos(anchorAngle), y + lift * Math.sin(anchorAngle))
        ctx.bezierCurveTo(
            x + end * Math.cos(anchorAngle) - handle * Math.sin(anchorAngle),
            y + end * Math.sin(anchorAngle) + handle * Math.cos(anchorAngle),
            endX + handle * Math.sin(labelAngle),
            endY - handle * Math.cos(labelAngle),
            clamp(endX, box.x - box.halfWidth, box.x + box.halfWidth),
            clamp(endY, box.y - box.halfHeight, box.y + box.halfHeight)
        )
        ctx.stroke()
    }

    private circle(ctx: CanvasRenderingContext2D, shape: ArcShape) {
        ctx.arc(shape.x, shape.y, this.canvas.radius, 0, FULL_ANGLE)

        if (this.canvas.innerRadius > 0) {
            ctx.moveTo(shape.x + this.canvas.innerRadius, shape.y)
            ctx.arc(shape.x, shape.y, this.canvas.innerRadius, FULL_ANGLE, 0, true)
        }
    }

    getBounds() {
        const radius = Math.abs(this.canvas.radius)

        return {
            left: this.canvas.x - radius,
            top: this.canvas.y - radius,
            right: this.canvas.x + radius,
            bottom: this.canvas.y + radius
        }
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp): void {
        const k = item.hoverFactor(isBackward, now, AnimationTiming.hover)

        if (item.hoverGroup == null)
            this.hover = k
        else
            item.animation.alpha = 1 - ALPHA_DELTA * k
    }

    isMouseOver(point: Point): boolean {
        return isInsideSector(point, this.canvas)
    }
}