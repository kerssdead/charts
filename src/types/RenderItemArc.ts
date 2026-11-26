import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import { AnimationTiming, FULL_ANGLE } from '@/static/constants/Index'
import Point from '@/types/Point'
import { GradientCache } from '@/helpers/Canvas'
import { lerp } from '@/helpers/Geometry'
import { ArcShape, isFullCircle, isInsideSector, traceSector } from '@/helpers/ArcSector'
import LeaderOrigin, { LeaderStart } from '@/types/interfaces/LeaderOrigin'

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
}

type ArcCanvas = ArcGeometry & {
    gap: number
    cornerRadius: number
}

export default class RenderItemArc extends RenderItemBase implements LeaderOrigin {
    isFill = false

    isGradient = false

    absolute: Point = { x: 0, y: 0 }

    radius = 10

    innerRadius = 0

    gap = 0

    cornerRadius = 0

    growOrigin: number | null = null

    hover = 0

    pull = 0

    readonly pop: Point = { x: 0, y: 0 }

    private drawnShape: ArcShape = { x: 0, y: 0, start: 0, end: 0, middle: 0 }

    private readonly gradient = new GradientCache()

    startAngle = 0

    endAngle: number = FULL_ANGLE

    from: ArcGeometry | null = null

    canvas: ArcCanvas = {
        ...this.current(),
        gap: this.gap,
        cornerRadius: this.cornerRadius
    }

    current(morph = 1): ArcGeometry {
        const result = {
            x: this.absolute.x,
            y: this.absolute.y,
            radius: this.radius,
            innerRadius: this.innerRadius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            pull: this.pull
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
            pull: lerp(this.from.pull, result.pull, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number) {
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

    adjust(window: CanvasWindow, morph = 1) {
        const from = this.from
        const isMorphing = from != null && morph < 1
        const x = isMorphing ? lerp(from.x, this.absolute.x, morph) : this.absolute.x
        const y = isMorphing ? lerp(from.y, this.absolute.y, morph) : this.absolute.y
        const radius = isMorphing ? lerp(from.radius, this.radius, morph) : this.radius
        const innerRadius = isMorphing ? lerp(from.innerRadius, this.innerRadius, morph) : this.innerRadius
        const startAngle = isMorphing ? lerp(from.startAngle, this.startAngle, morph) : this.startAngle
        const endAngle = isMorphing ? lerp(from.endAngle, this.endAngle, morph) : this.endAngle
        const pull = isMorphing ? lerp(from.pull, this.pull, morph) : this.pull
        const canvas = this.canvas

        canvas.x = window.mapX(x)
        canvas.y = window.mapY(y)
        canvas.radius = window.scaleX(radius)
        canvas.innerRadius = window.scaleX(innerRadius)
        canvas.gap = window.scaleX(this.gap)
        canvas.cornerRadius = window.scaleX(this.cornerRadius)
        canvas.startAngle = startAngle
        canvas.endAngle = endAngle
        canvas.pull = window.scaleX(pull)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem) {
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

        const drawn = this.drawnShape

        drawn.x = this.canvas.x + this.pop.x
        drawn.y = this.canvas.y + this.pop.y
        drawn.start = start
        drawn.end = end
        drawn.middle = middle

        return drawn
    }

    private circle(ctx: CanvasRenderingContext2D, shape: ArcShape) {
        ctx.arc(shape.x, shape.y, this.canvas.radius, 0, FULL_ANGLE)

        if (this.canvas.innerRadius > 0) {
            ctx.moveTo(shape.x + this.canvas.innerRadius, shape.y)
            ctx.arc(shape.x, shape.y, this.canvas.innerRadius, FULL_ANGLE, 0, true)
        }
    }

    private get hoverOffset() {
        return isFullCircle(this.drawnShape.end - this.drawnShape.start) ? 0 : HOVER_OFFSET * this.hover
    }

    leaderOrigin(): LeaderStart {
        const { x, y, middle } = this.drawnShape
        const lift = this.hoverOffset

        return {
            x: x - lift * Math.cos(middle),
            y: y - lift * Math.sin(middle),
            angle: middle,
            distance: this.canvas.radius,
            lift
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

    getFocusBounds() {
        return null
    }

    getFocusPoint() {
        const { x, y, radius, innerRadius, startAngle, endAngle, pull } = this.canvas
        const middle = (startAngle + endAngle) / 2
        const distance = pull + (radius + innerRadius) / 2

        return { x: x + distance * Math.cos(middle), y: y + distance * Math.sin(middle) }
    }

    animate(item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) {
        const k = item.hoverFactor(isBackward, now, AnimationTiming.hover)

        if (item.hoverGroup == null)
            this.hover = k
        else
            item.animation.alpha = 1 - ALPHA_DELTA * k
    }

    isMouseOver(point: Point) {
        return isInsideSector(point, this.canvas)
    }
}