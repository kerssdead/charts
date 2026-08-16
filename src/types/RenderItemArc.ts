import CanvasWindow from './CanvasWindow';
import RenderItemBase from './interfaces/RenderItemBase'
import RenderItem from './RenderItem'
import { COORDS_MAX_X } from 'static/constants/Index'

export default class RenderItemArc implements RenderItemBase {
    adjust(window: CanvasWindow): void {
        this.x1 = RenderItem.adjustX(window, this.x)
        this.y1 = RenderItem.adjustY(window, this.y)

        this.radius1 = this.radius * (window.width / COORDS_MAX_X)
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.arc(
            this.x1,
            this.y1,
            this.radius1,
            this.startAngle,
            this.endAngle
        )

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()
    }

    isFill: boolean = false

    x: number = 0

    y: number = 0

    x1: number = 0

    y1: number = 0

    radius: number = 10

    radius1: number = 10

    startAngle: number = 0

    endAngle: number = Math.PI * 2
}