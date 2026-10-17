import CanvasWindow from 'types/CanvasWindow'
import RenderItemBase from 'types/interfaces/RenderItemBase'
import { Animations, COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import RenderItem from 'types/RenderItem'
import Point from 'types/Point'
import { Alignment } from 'types/Alignment'
import { HorizontalAlignment, VerticalAlignment } from 'static/Enums'
import RectangleDimensions from 'types/RectangleDimensions'
import Canvas from 'helpers/Canvas'

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

export default class RenderItemRectangle
    implements RenderItemBase {
    isFill: boolean

    isGradient: boolean = false

    radii: number[]

    fromRadii: number[] | null = null

    private radii1: number[] | number = 0

    absolute: RectangleDimensions = new RectangleDimensions()

    canvas: RectangleDimensions = new RectangleDimensions()

    align: Alignment = Alignment.default

    growAxis: 'x' | 'y' | null = null

    growOrigin: number = 0

    collapse = { width: true, height: true }

    from: RectangleDimensions | null = null

    private canvasGrowOrigin: number = 0

    current(morph: number = 1): RectangleDimensions {
        const result = Object.assign(new RectangleDimensions(), this.absolute)

        if (!this.from || morph >= 1)
            return result

        const lerp = (from: number, to: number) => {
            return from + (to - from) * morph
        }

        result.x = lerp(this.from.x, this.absolute.x)
        result.y = lerp(this.from.y, this.absolute.y)
        result.width = lerp(this.from.width, this.absolute.width)
        result.height = lerp(this.from.height, this.absolute.height)

        return result
    }

    currentRadii(morph: number = 1): number[] {
        const radii = this.radii ?? [0, 0, 0, 0]

        if (!this.fromRadii || morph >= 1)
            return [...radii]

        const flatten = 1 - Math.pow(1 - morph, 4)
        const round = Math.pow(morph, 4)

        return radii.map((radius, i) => {
            const from = this.fromRadii![i] ?? 0

            return from + (radius - from) * (radius < from ? flatten : round)
        })
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const absolute = this.current(morph)

        this.radii1 = this.currentRadii(morph)

        this.canvas.x = RenderItem.adjustX(window, absolute.x)
        this.canvas.y = RenderItem.adjustY(window, absolute.y)
        this.canvas.width = absolute.width / COORDS_MAX_X * window.width
        this.canvas.height = absolute.height / COORDS_MAX_Y * window.height

        this.canvasGrowOrigin = this.growAxis == 'x'
                                ? RenderItem.adjustX(window, this.growOrigin)
                                : RenderItem.adjustY(window, this.growOrigin)
    }

    render(ctx: CanvasRenderingContext2D, _window?: CanvasWindow, item?: RenderItem): void {
        const { left, top, width, height } = this.grow(item?.animation.init ?? 1)

        ctx.roundRect(left, top, width, height, this.radii1)

        if (this.isGradient && item && height != 0) {
            ctx.fillStyle = ctx.strokeStyle = Canvas.verticalGradient(ctx, item.activeColor, top, top + height)
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

    // todo: implement
    tooltip(item: RenderItem, point: Point) {
        return true
    }

    // todo: implement
    contextMenu(item: RenderItem, point: Point): boolean {
        return true
    }

    isMouseOver(point: Point) {
        const { left, top, width, height } = this.bounds()

        return left <= point.x && point.x <= left + width
               && top <= point.y && point.y <= top + height
    }

    animate(item: RenderItem, isBackward = false) {
        const k = item.hoverFactor(isBackward, Animations.hover)

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
                left: origin + (bounds.left - origin) * progress,
                width: bounds.width * progress
            }
        }

        return {
            ...bounds,
            top: origin + (bounds.top - origin) * progress,
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