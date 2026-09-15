import CanvasWindow from './CanvasWindow'
import RenderItemBase from './interfaces/RenderItemBase'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import RenderItem from './RenderItem'
import Point from './Point'
import { adjustColor } from '../Helper'
import { DefaultRenderer } from '../render/DefaultRenderer'
import Animations from '../Animations'
import { Alignment } from './Alignment'
import { HorizontalAlignment, VerticalAlignment } from '../static/Enums'

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

        let x = this.x1
        let y = this.y1

        switch (this.align.x) {
            case HorizontalAlignment.Left:
                break
            case HorizontalAlignment.Center:
                x -= width / 2
                break
            case HorizontalAlignment.Right:
                x -= width
                break
        }

        switch (this.align.y) {
            case VerticalAlignment.Top:
                break
            case VerticalAlignment.Center:
                y -= height / 2
                break
            case VerticalAlignment.Bottom:
                y -= height
                break
        }

        if (this.roundedCorners) {
            ctx.roundRect(x, y, width, height, this.roundedCorners)
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
        let isHorizontal = false
        let isVertical = false

        switch (this.align.x) {
            case HorizontalAlignment.Center:
                const halfWidth = this.width1 / 2
                isHorizontal = this.x1 - halfWidth <= point.x && point.x <= this.x1 + halfWidth
                break

            case HorizontalAlignment.Left:
                isHorizontal = this.x1 <= point.x && point.x <= this.x1 + this.width1
                break

            case HorizontalAlignment.Right:
                isHorizontal = this.x1 - this.width1 <= point.x && point.x <= this.x1
                break
        }

        switch (this.align.y) {
            case VerticalAlignment.Center:
                const halfHeight = this.height1 / 2
                isVertical = this.y1 - halfHeight <= point.y && point.y <= this.y1 + halfHeight
                break

            case VerticalAlignment.Top:
                isVertical = this.y1 <= point.y && point.y <= this.y1 + this.height1
                break

            case VerticalAlignment.Bottom:
                isVertical = this.y1 - this.height1 <= point.y && point.y <= this.y1
                break
        }

        return isHorizontal && isVertical
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

    roundedCorners: number[] | null

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

    align: Alignment = Alignment.default
}