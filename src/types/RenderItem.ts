import { RenderStepType } from '../static/Enums'
import { COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from 'static/constants/Index'
import CanvasWindow from './CanvasWindow'
import RenderItemLine from './RenderItemLine'
import RenderItemRectangle from './RenderItemRectangle'
import RenderItemArc from './RenderItemArc'
import RenderItemGroup from './RenderItemGroup'
import RenderItemBase from './interfaces/RenderItemBase'
import Point from './Point'
import { adjustColor } from '../Helper'
import { DefaultRenderer } from '../render/DefaultRenderer'

export default class RenderItem {
    isAnimate: boolean = false

    type: RenderStepType

    color: string

    activeColor: string

    layer: number = 0

    line: RenderItemLine

    rect: RenderItemRectangle

    arc: RenderItemArc

    group: RenderItemGroup

    // todo: group to RenderItemAnimationItem ?
    startTimer: DOMHighResTimeStamp | null

    // todo: group to RenderItemAnimationItem ?
    mouseLeave: boolean

    private items(): RenderItemBase[] {
        return [this.line, this.rect, this.arc, this.group]
    }

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow) {
        this.adjust(window)

        ctx.beginPath()

        ctx.lineWidth = DEFAULT_LINE_WIDTH

        ctx.fillStyle = this.activeColor
        ctx.strokeStyle = this.activeColor

        for (const item of this.items()) {
            item?.render(ctx, window)
            if (item)
                return
        }
    }

    animate(point: Point) {
        if (!this.isAnimate) {
            return
        }

        for (const item of this.items()) {
            if (item) {
                this.continueAnimate(point, item)
                return
            }
        }
    }

    private adjust(window: CanvasWindow): void {
        for (const item of this.items()) {
            item?.adjust(window)
            if (item)
                return
        }
    }

    private continueAnimate(point: Point, item: RenderItemBase) {
        if (item.isMouseOver(point)) {
            if (this.mouseLeave) {
                this.mouseLeave = false
            }

            item.animate(this, false, point)
        } else if (this.startTimer) {
            if (!this.mouseLeave && DefaultRenderer.timer - this.startTimer > 450) {
                this.startTimer = null
            }
            this.mouseLeave = true

            item.animate(this, true, point)

            if (this.startTimer && DefaultRenderer.timer - this.startTimer > 450) {
                this.mouseLeave = false
                this.startTimer = null
            }
        }
    }

    static adjustX(window: CanvasWindow, x: number) {
        return Math.round(x / COORDS_MAX_X * window.width + window.x)
    }

    static adjustY(window: CanvasWindow, y: number) {
        return Math.round(y / COORDS_MAX_Y * window.height + window.y)
    }
}