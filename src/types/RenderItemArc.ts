import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, COORDS_MAX_X } from '@/static/constants/Index'
import Point from '@/types/Point'
import Theme from '@/Theme'
import Canvas from '@/helpers/Canvas'

const FULL_CIRCLE_EPSILON = 1e-6

const HOVER_OFFSET = 8

const isFullCircle = (sweep: number) => sweep >= Math.PI * 2 - FULL_CIRCLE_EPSILON

type ArcGeometry = {
    x: number
    y: number
    radius: number
    innerRadius: number
    startAngle: number
    endAngle: number
}

type ArcCanvas = ArcGeometry & {
    gap: number
    cornerRadius: number
    leaderGap: number
    leaderLength: number
}

type Shape = {
    x: number
    y: number
    start: number
    end: number
    middle: number
}

export default class RenderItemArc
    extends RenderItemBase {
    from: ArcGeometry | null = null

    current(morph: number = 1): ArcGeometry {
        const result = {
            x: this.absolute.x,
            y: this.absolute.y,
            radius: this.radius,
            innerRadius: this.innerRadius,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        }

        if (!this.from || morph >= 1)
            return result

        const lerp = (from: number, to: number) => {
            return from + (to - from) * morph
        }

        return {
            x: lerp(this.from.x, result.x),
            y: lerp(this.from.y, result.y),
            radius: lerp(this.from.radius, result.radius),
            innerRadius: lerp(this.from.innerRadius, result.innerRadius),
            startAngle: lerp(this.from.startAngle, result.startAngle),
            endAngle: lerp(this.from.endAngle, result.endAngle)
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
            endAngle: geometry.endAngle
        }
    }

    render(ctx: CanvasRenderingContext2D, item?: RenderItem): void {
        const shape = this.shape(item?.animation.init ?? 1)

        if (this.isGradient && item)
            ctx.fillStyle = ctx.strokeStyle = Canvas.verticalGradient(ctx, item.activeColor,
                shape.y - this.canvas.radius, shape.y + this.canvas.radius)

        if (isFullCircle(shape.end - shape.start))
            this.circle(ctx, shape)
        else if (!this.sector(ctx, shape))
            return

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()

        this.leader(ctx, shape)
    }

    private shape(progress: number): Shape {
        let start = this.canvas.startAngle
        let end = this.canvas.endAngle

        if (this.growOrigin != null && progress < 1) {
            start = this.growOrigin + (start - this.growOrigin) * progress
            end = this.growOrigin + (end - this.growOrigin) * progress
        }

        const middle = (start + end) / 2
        const offset = isFullCircle(end - start) ? 0 : HOVER_OFFSET * this.hover

        this.pop.x = offset * Math.cos(middle)
        this.pop.y = offset * Math.sin(middle)

        return { x: this.canvas.x + this.pop.x, y: this.canvas.y + this.pop.y, start, end, middle }
    }

    private leader(ctx: CanvasRenderingContext2D, shape: Shape) {
        const visibility = this.leaderLabel?.animation.visibility ?? 0

        if (visibility <= 0)
            return

        const labelAngle = shape.middle + this.leaderOffset

        const start = this.canvas.radius + this.canvas.leaderGap
        const end = start + this.canvas.leaderLength

        ctx.globalAlpha *= visibility
        ctx.strokeStyle = Theme.line

        ctx.beginPath()
        ctx.moveTo(shape.x + start * Math.cos(shape.middle), shape.y + start * Math.sin(shape.middle))
        ctx.quadraticCurveTo(
            shape.x + end * Math.cos(shape.middle), shape.y + end * Math.sin(shape.middle),
            shape.x + end * Math.cos(labelAngle), shape.y + end * Math.sin(labelAngle)
        )
        ctx.stroke()
    }

    private circle(ctx: CanvasRenderingContext2D, shape: Shape) {
        ctx.arc(shape.x, shape.y, this.canvas.radius, 0, Math.PI * 2)

        if (this.canvas.innerRadius > 0) {
            ctx.moveTo(shape.x + this.canvas.innerRadius, shape.y)
            ctx.arc(shape.x, shape.y, this.canvas.innerRadius, Math.PI * 2, 0, true)
        }
    }

    private sector(ctx: CanvasRenderingContext2D, shape: Shape): boolean {
        const angle = shape.end - shape.start

        if (angle <= 0)
            return false

        const half = this.canvas.gap / 2
        const sin = Math.sin(Math.min(angle, Math.PI) / 2)
        const outer = this.canvas.radius

        if (outer * sin <= half)
            return false

        const isApex = this.canvas.innerRadius * sin <= half
        const inner = isApex
                      ? Math.max(Math.min(half / sin, this.canvas.gap), this.canvas.innerRadius)
                      : this.canvas.innerRadius

        const radial = (outer - inner) / 2
        const outerCorner = Math.max(Math.min(
            this.canvas.cornerRadius,
            radial,
            angle < Math.PI ? (outer * sin - half) / (1 + sin) : Infinity
        ), 0)
        const innerCorner = isApex ? 0 : Math.max(Math.min(
            this.canvas.cornerRadius,
            radial,
            sin < 1 ? (inner * sin - half) / (1 - sin) : Infinity
        ), 0)

        const outerStart = this.corner(shape, shape.start, 1, outer, outerCorner, true)
        const outerEnd = this.corner(shape, shape.end, -1, outer, outerCorner, true)

        this.cornerArc(ctx, outerStart, outerCorner, outerStart.edge, outerStart.circle)
        ctx.arc(shape.x, shape.y, outer, outerStart.angle, outerEnd.angle)
        this.cornerArc(ctx, outerEnd, outerCorner, outerEnd.circle, outerEnd.edge)

        if (isApex) {
            ctx.lineTo(shape.x + inner * Math.cos(shape.middle), shape.y + inner * Math.sin(shape.middle))
        } else {
            const innerEnd = this.corner(shape, shape.end, -1, inner, innerCorner, false)
            const innerStart = this.corner(shape, shape.start, 1, inner, innerCorner, false)

            this.cornerArc(ctx, innerEnd, innerCorner, innerEnd.edge, innerEnd.circle)
            ctx.arc(shape.x, shape.y, inner, innerEnd.angle, innerStart.angle, true)
            this.cornerArc(ctx, innerStart, innerCorner, innerStart.circle, innerStart.edge)
        }

        ctx.closePath()

        return true
    }

    private cornerArc(ctx: CanvasRenderingContext2D, center: Point, radius: number, from: number, to: number) {
        const turn = Math.atan2(Math.sin(to - from), Math.cos(to - from))

        ctx.arc(center.x, center.y, radius, from, from + turn, turn < 0)
    }

    private corner(shape: Shape, edgeAngle: number, side: 1 | -1, radius: number, corner: number, isOuter: boolean) {
        const offset = this.canvas.gap / 2 + corner
        const distance = isOuter ? radius - corner : radius + corner
        const along = Math.sqrt(Math.max(distance * distance - offset * offset, 0))

        const angle = edgeAngle + Math.atan2(side * offset, along)

        const x = shape.x + distance * Math.cos(angle)
        const y = shape.y + distance * Math.sin(angle)

        const edgeX = shape.x + along * Math.cos(edgeAngle) - side * this.canvas.gap / 2 * Math.sin(edgeAngle)
        const edgeY = shape.y + along * Math.sin(edgeAngle) + side * this.canvas.gap / 2 * Math.cos(edgeAngle)

        return {
            x,
            y,
            angle,
            edge: Math.atan2(edgeY - y, edgeX - x),
            circle: isOuter ? angle : angle + Math.PI
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

    animate(item: RenderItem, isBackward: boolean): void {
        this.hover = item.hoverFactor(isBackward, AnimationTiming.hover)
    }

    isMouseOver(point: Point): boolean {
        const dx = point.x - this.canvas.x
        const dy = point.y - this.canvas.y

        const distance = dx * dx + dy * dy

        if (distance > this.canvas.radius * this.canvas.radius || distance < this.canvas.innerRadius * this.canvas.innerRadius)
            return false

        const sweep = this.canvas.endAngle - this.canvas.startAngle

        if (isFullCircle(sweep))
            return true

        const full = Math.PI * 2
        const angle = ((Math.atan2(dy, dx) - this.canvas.startAngle) % full + full) % full

        return angle <= sweep
    }

    isFill: boolean = false

    isGradient: boolean = false

    absolute: Point = { x: 0, y: 0 }

    canvas: ArcCanvas = {
        x: 0,
        y: 0,
        radius: 10,
        innerRadius: 0,
        gap: 0,
        cornerRadius: 0,
        leaderGap: 0,
        leaderLength: 0,
        startAngle: 0,
        endAngle: Math.PI * 2
    }

    radius: number = 10

    innerRadius: number = 0

    gap: number = 0

    cornerRadius: number = 0

    growOrigin: number | null = null

    leaderGap: number = 0

    leaderLength: number = 0

    leaderOffset: number = 0

    leaderLabel: RenderItem | null = null

    hover: number = 0

    readonly pop: Point = { x: 0, y: 0 }

    startAngle: number = 0

    endAngle: number = Math.PI * 2
}