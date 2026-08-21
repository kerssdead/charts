import { RenderStepType } from '../static/Enums'
import { COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from 'static/constants/Index'
import CanvasWindow from './CanvasWindow'
import RenderItemLine from './RenderItemLine'
import RenderItemRectangle from './RenderItemRectangle'
import RenderItemArc from './RenderItemArc'
import RenderItemGroup from './RenderItemGroup'
import RenderItemBase from './interfaces/RenderItemBase'

export default class RenderItem {
    type: RenderStepType

    color: string

    layer: number = 0

    line: RenderItemLine

    rect: RenderItemRectangle

    arc: RenderItemArc

    group: RenderItemGroup

    private items(): RenderItemBase[] {
        return [this.line, this.rect, this.arc, this.group]
    }

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow) {
        this.adjust(window)

        ctx.beginPath()

        ctx.lineWidth = DEFAULT_LINE_WIDTH

        ctx.fillStyle = this.color
        ctx.strokeStyle = this.color

        for (const item of this.items()) {
            item?.render(ctx, window)
            if (item)
                return
        }
    }

    private adjust(window: CanvasWindow): void {
        for (const item of this.items()) {
            item?.adjust(window)
            if (item)
                return
        }
    }

    static adjustX(window: CanvasWindow, x: number) {
        return Math.round(x / COORDS_MAX_X * window.width + window.x)
    }

    static adjustY(window: CanvasWindow, y: number) {
        return Math.round(y / COORDS_MAX_Y * window.height + window.y)
    }

    // todo: meh name
    static reAdjustX(window: CanvasWindow, x: number) {
        return Math.round((x - window.x) / window.width)
    }

    // todo: meh name
    static reAdjustY(window: CanvasWindow, y: number) {
        return Math.round((y - window.y) / window.height)
    }
}