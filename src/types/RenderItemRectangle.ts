import CanvasWindow from './CanvasWindow'
import RenderItemBase from './interfaces/RenderItemBase'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import RenderItem from './RenderItem'
import Point from './Point'
import { DefaultRenderer } from '../render/DefaultRenderer'
import Animations from '../Animations'
import { Alignment } from './Alignment'
import { HorizontalAlignment, VerticalAlignment } from '../static/Enums'
import RectangleDimensions from './RectangleDimensions'

const ANIMATION_DURATION = 450
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

    radii: number[]

    absolute: RectangleDimensions = new RectangleDimensions()

    canvas: RectangleDimensions = new RectangleDimensions()

    align: Alignment = Alignment.default

    adjust(window: CanvasWindow): void {
        this.canvas.x = RenderItem.adjustX(window, this.absolute.x)
        this.canvas.y = RenderItem.adjustY(window, this.absolute.y)
        this.canvas.width = this.absolute.width / COORDS_MAX_X * window.width
        this.canvas.height = this.absolute.height / COORDS_MAX_Y * window.height
    }

    render(ctx: CanvasRenderingContext2D): void {
        const { left, top, width, height } = this.bounds(1)

        ctx.roundRect(left, top, width, height, this.radii || 0)

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()
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
        const k = this.factor(item, isBackward)

        item.animation.scale = 1 - SCALE_DELTA * k
        item.animation.alpha = 1 - ALPHA_DELTA * k
    }

    private factor(item: RenderItem, isBackward: boolean) {
        item.startTimer ??= DefaultRenderer.timer

        const progress = Math.min((DefaultRenderer.timer - item.startTimer) / ANIMATION_DURATION, 1)
        const transition = Animations.getTransition(progress)

        return isBackward
               ? (1 - progress) * (1 - transition)
               : progress * transition
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