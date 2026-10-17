import CanvasWindow from 'types/CanvasWindow'
import RenderItemBase from 'types/interfaces/RenderItemBase'
import RenderItem from 'types/RenderItem'
import { Animations, COORDS_MAX_X } from 'static/constants/Index'
import Point from 'types/Point'
import Theme from 'Theme'
import Canvas from 'helpers/Canvas'

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

type Shape = {
    x: number
    y: number
    start: number
    end: number
    middle: number
}

export default class RenderItemArc implements RenderItemBase {
    from: ArcGeometry | null = null

    current(morph: number = 1): ArcGeometry {
        const result = {
            x: this.x,
            y: this.y,
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

    adjust(window: CanvasWindow, morph: number = 1): void {
        const geometry = this.current(morph)
        const scale = window.width / COORDS_MAX_X

        this.x1 = RenderItem.adjustX(window, geometry.x)
        this.y1 = RenderItem.adjustY(window, geometry.y)

        this.radius1 = geometry.radius * scale
        this.innerRadius1 = geometry.innerRadius * scale
        this.gap1 = this.gap * scale
        this.cornerRadius1 = this.cornerRadius * scale
        this.leaderGap1 = this.leaderGap * scale
        this.leaderLength1 = this.leaderLength * scale

        this.startAngle1 = geometry.startAngle
        this.endAngle1 = geometry.endAngle
    }

    render(ctx: CanvasRenderingContext2D, item?: RenderItem): void {
        const shape = this.shape(item?.animation.init ?? 1)

        if (this.isGradient && item)
            ctx.fillStyle = ctx.strokeStyle = Canvas.verticalGradient(ctx, item.activeColor,
                shape.y - this.radius1, shape.y + this.radius1)

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
        let start = this.startAngle1
        let end = this.endAngle1

        if (this.growOrigin != null && progress < 1) {
            start = this.growOrigin + (start - this.growOrigin) * progress
            end = this.growOrigin + (end - this.growOrigin) * progress
        }

        const middle = (start + end) / 2
        const offset = isFullCircle(end - start) ? 0 : HOVER_OFFSET * this.hover

        this.pop.x = offset * Math.cos(middle)
        this.pop.y = offset * Math.sin(middle)

        return { x: this.x1 + this.pop.x, y: this.y1 + this.pop.y, start, end, middle }
    }

    private leader(ctx: CanvasRenderingContext2D, shape: Shape) {
        const visibility = this.leaderLabel?.animation.visibility ?? 0

        if (visibility <= 0)
            return

        const labelAngle = shape.middle + this.leaderOffset

        const start = this.radius1 + this.leaderGap1
        const end = start + this.leaderLength1

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
        ctx.arc(shape.x, shape.y, this.radius1, 0, Math.PI * 2)

        if (this.innerRadius1 > 0) {
            ctx.moveTo(shape.x + this.innerRadius1, shape.y)
            ctx.arc(shape.x, shape.y, this.innerRadius1, Math.PI * 2, 0, true)
        }
    }

    private sector(ctx: CanvasRenderingContext2D, shape: Shape): boolean {
        const angle = shape.end - shape.start

        if (angle <= 0)
            return false

        const half = this.gap1 / 2
        const sin = Math.sin(Math.min(angle, Math.PI) / 2)
        const outer = this.radius1

        if (outer * sin <= half)
            return false

        const isApex = this.innerRadius1 * sin <= half
        // thin sectors taper to the center instead of ending where the shifted edges intersect
        const inner = isApex
                      ? Math.max(Math.min(half / sin, this.gap1), this.innerRadius1)
                      : this.innerRadius1

        const radial = (outer - inner) / 2
        const outerCorner = Math.max(Math.min(
            this.cornerRadius1,
            radial,
            angle < Math.PI ? (outer * sin - half) / (1 + sin) : Infinity
        ), 0)
        const innerCorner = isApex ? 0 : Math.max(Math.min(
            this.cornerRadius1,
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
        const offset = this.gap1 / 2 + corner
        const distance = isOuter ? radius - corner : radius + corner
        const along = Math.sqrt(Math.max(distance * distance - offset * offset, 0))

        const angle = edgeAngle + Math.atan2(side * offset, along)

        const x = shape.x + distance * Math.cos(angle)
        const y = shape.y + distance * Math.sin(angle)

        const edgeX = shape.x + along * Math.cos(edgeAngle) - side * this.gap1 / 2 * Math.sin(edgeAngle)
        const edgeY = shape.y + along * Math.sin(edgeAngle) + side * this.gap1 / 2 * Math.cos(edgeAngle)

        return {
            x,
            y,
            angle,
            edge: Math.atan2(edgeY - y, edgeX - x),
            circle: isOuter ? angle : angle + Math.PI
        }
    }

    getBounds() {
        const radius = Math.abs(this.radius1)

        return {
            left: this.x1 - radius,
            top: this.y1 - radius,
            right: this.x1 + radius,
            bottom: this.y1 + radius
        }
    }

    animate(item: RenderItem, isBackward: boolean): void {
        this.hover = item.hoverFactor(isBackward, Animations.hover)
    }

    tooltip(item: RenderItem, point: Point) {
        return true
    }

    contextMenu(item: RenderItem, point: Point): boolean {
        return true
    }

    isMouseOver(point: Point): boolean {
        const dx = point.x - this.x1
        const dy = point.y - this.y1

        const distance = dx * dx + dy * dy

        if (distance > this.radius1 * this.radius1 || distance < this.innerRadius1 * this.innerRadius1)
            return false

        const sweep = this.endAngle1 - this.startAngle1

        if (isFullCircle(sweep))
            return true

        const full = Math.PI * 2
        const angle = ((Math.atan2(dy, dx) - this.startAngle1) % full + full) % full

        return angle <= sweep
    }

    isFill: boolean = false

    isGradient: boolean = false

    x: number = 0

    y: number = 0

    x1: number = 0

    y1: number = 0

    radius: number = 10

    radius1: number = 10

    innerRadius: number = 0

    innerRadius1: number = 0

    gap: number = 0

    gap1: number = 0

    cornerRadius: number = 0

    cornerRadius1: number = 0

    growOrigin: number | null = null

    leaderGap: number = 0

    leaderGap1: number = 0

    leaderLength: number = 0

    leaderLength1: number = 0

    leaderOffset: number = 0

    leaderLabel: RenderItem | null = null

    hover: number = 0

    readonly pop: Point = { x: 0, y: 0 }

    startAngle: number = 0

    endAngle: number = Math.PI * 2

    startAngle1: number = 0

    endAngle1: number = Math.PI * 2
}