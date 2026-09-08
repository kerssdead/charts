import CanvasWindow from './CanvasWindow'
import RenderItemBase from './interfaces/RenderItemBase'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import RenderItem from './RenderItem'
import Point from './Point'
import { adjustColor } from '../Helper'
import { DefaultRenderer } from '../render/DefaultRenderer'
import Animations from '../Animations'

export default class RenderItemRectangle
    implements RenderItemBase {
    adjust(window: CanvasWindow): void {
        this.x1 = RenderItem.adjustX(window, this.x)
        this.y1 = RenderItem.adjustY(window, this.y)
        this.width1 = this.width / COORDS_MAX_X * window.width
        this.height1 = this.height / COORDS_MAX_Y * window.height
    }

    render(ctx: CanvasRenderingContext2D): void {
        const width = this.width1 * this.activeScale
        const height = this.height1 * this.activeScale

        const x = this.x1 - width / 2
        const y = this.y1 - height / 2

        if (this.isRounded) {
            ctx.roundRect(x, y, width, height)
        } else {
            ctx.rect(x, y, width, height)
        }

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()
    }

    animate(item: RenderItem, isBackward: boolean = false) {
        item.activeColor = adjustColor(
            item.color,
            Math.round(this.opacity(item, 1, isBackward) * -100)
        )
        this.activeScale = this.scale(item, 0.98, isBackward)
    }

    isMouseOver(point: Point) {
        const halfWidth = this.width1 / 2
        const halfHeight = this.height1 / 2
        return this.x1 - halfWidth <= point.x && point.x <= this.x1 + halfWidth
               && this.y1 - halfHeight <= point.y && point.y <= this.y1 + halfHeight;
    }

    private opacity(item: RenderItem, value: number, isBackward: boolean = false) {
        item.startTimer ??= DefaultRenderer.timer

        const diff = DefaultRenderer.timer - item.startTimer
        const duration = 450

        let transition = Animations.getTransition(diff > duration ? 1 : diff / duration)

        if (isBackward) {
            transition = Math.abs(1 - transition)
        }

        if (diff > duration) {
            if (isBackward) {
                return 1 - value
            }

            return value
        }

        if (isBackward) {
            return (1 - (diff / duration)) * value * transition
        }

        return diff / duration * value * transition
    }

    private scale(item: RenderItem, value: number, isBackward: boolean = false) {
        item.startTimer ??= DefaultRenderer.timer

        value -= 1

        const diff = DefaultRenderer.timer - item.startTimer
        const duration = 450

        let transition = Animations.getTransition(diff > duration ? 1 : diff / duration)

        if (isBackward) {
            transition = Math.abs(1 - transition)
        }

        if (diff > duration) {
            if (isBackward) {
                return 1
            }

            return 1 + value
        }

        if (isBackward) {
            return 1 + (1 - (diff / duration)) * value * transition
        }

        return 1 + diff / duration * value * transition
    }

    isFill: boolean = false

    isRounded: boolean = false

    x: number = 0

    // todo: meh solution
    x1: number = 0

    y: number = 0

    // todo: meh solution
    y1: number = 0

    width: number = 1

    // todo: meh solution
    width1: number = 1

    height: number = 1

    // todo: meh solution
    height1: number = 1

    activeScale: number = 1
}