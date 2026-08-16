import Point from './Point'
import RenderItemBase from './interfaces/RenderItemBase'
import CanvasWindow from './CanvasWindow'
import RenderItem from './RenderItem'

export default class RenderItemLine
    implements RenderItemBase {
    stops: Point[] = []

    // todo: meh solution
    stops1: Point[] = []

    width: number = 1

    adjust(window: CanvasWindow): void {
        this.stops1 = []

        for (let stop of this.stops) {
            this.stops1.push({ x: RenderItem.adjustX(window, stop.x), y: RenderItem.adjustY(window, stop.y) })
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = this.width

        if (this.stops1) {
            ctx.moveTo(this.stops1[0].x, this.stops1[0].y)
        }

        for (const stop of this.stops1.slice(1)) {
            ctx.lineTo(stop.x, stop.y)
        }

        ctx.stroke()
    }
}