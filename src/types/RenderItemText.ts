import CanvasWindow from './CanvasWindow';
import RenderItemBase from './interfaces/RenderItemBase'
import Point from './Point'
import RenderItem from './RenderItem'
import { stringWidth } from '../Helper'
import { TextAlignment } from '../static/Enums'

export default class RenderItemText
    implements RenderItemBase {
    value: string

    x: number

    y: number

    // todo: meh solution
    x1: number

    // todo: meh solution
    y1: number

    fontSize: number = 14

    rotate: number = 0

    alignment: TextAlignment = TextAlignment.Center

    private get font(): string {
        return `${this.fontSize}px Arial`
    }

    adjust(window: CanvasWindow): void {
        this.x1 = RenderItem.adjustX(window, this.x) - this.fontSize / 2
        this.y1 = RenderItem.adjustY(window, this.y) + this.fontSize * 0.3
    }

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow): void {
        ctx.font = this.font
        ctx.textAlign = this.alignment

        if (this.rotate != 0) {
            ctx.save()

            ctx.translate(this.x1, this.y1)
            ctx.rotate(this.rotate * Math.PI / 180)

            ctx.fillText(this.value, 0, 0)

            ctx.restore()
        } else {
            ctx.fillText(this.value, this.x1, this.y1)
        }
    }

    animate(item: RenderItem, isBackward: boolean, point: Point): void {
        // todo
    }

    isMouseOver(point: Point): boolean {
        // todo
        return false
    }
}