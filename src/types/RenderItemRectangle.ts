import CanvasWindow from './CanvasWindow'
import RenderItemBase from './interfaces/RenderItemBase'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import RenderItem from './RenderItem'

export default class RenderItemRectangle
    implements RenderItemBase {
    adjust(window: CanvasWindow): void {
        this.x1 = RenderItem.adjustX(window, this.x)
        this.y1 = RenderItem.adjustY(window, this.y)
        this.width1 = this.width / COORDS_MAX_X * window.width
        this.height1 = this.height / COORDS_MAX_Y * window.height
    }

    render(ctx: CanvasRenderingContext2D): void {
        const width = this.width1
        const height = this.height1

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
}