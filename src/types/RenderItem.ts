import { RenderStepType } from '../static/Enums'
import Point from './Point'
import { DEFAULT_LINE_WIDTH } from 'static/constants/Index'

export default class RenderItem {
    type: RenderStepType

    color: string

    // todo: move line parameters to separate object
    // Line

    stops: Point[] = []

    // todo: meh solution
    stops1: Point[] = []

    width: number = 1

    // todo: move rectangle parameters to separate object
    // Rectangle

    isFill: boolean = false

    isRounded: boolean = false

    rectX: number = 0

    // todo: meh solution
    rectX1: number = 0

    rectY: number = 0

    // todo: meh solution
    rectY1: number = 0

    rectWidth: number = 1

    // todo: meh solution
    rectWidth1: number = 1

    rectHeight: number = 1

    // todo: meh solution
    rectHeight1: number = 1

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()

        ctx.lineWidth = DEFAULT_LINE_WIDTH

        ctx.fillStyle = this.color

        if (this.type == RenderStepType.Line) {
            ctx.strokeStyle = this.color
            ctx.lineWidth = this.width

            if (this.stops1) {
                ctx.moveTo(this.stops1[0].x, this.stops1[0].y)
            }

            for (const stop of this.stops1.slice(1)) {
                ctx.lineTo(stop.x, stop.y)
            }

            ctx.stroke()

            return
        }

        if (this.type == RenderStepType.Rect) {
            const x = this.rectX1 - this.rectWidth / 2
            const y = this.rectY1 - this.rectHeight / 2

            if (this.isRounded) {
                ctx.roundRect(x, y, this.rectWidth, this.rectHeight)
            } else {
                ctx.rect(x, y, this.rectWidth, this.rectHeight)
            }

            if (this.isFill) {
                ctx.fill()
            }

            ctx.stroke()

            return
        }
    }

    adjust(
        x: (x: number) => number,
        y: (y: number) => number
    ) {
        if (this.type == RenderStepType.Line) {
            this.stops1 = []

            for (let stop of this.stops) {
                this.stops1.push({ x: x(stop.x), y: y(stop.y) })
            }
        }

        if (this.type == RenderStepType.Rect) {
            this.rectX1 = x(this.rectX)
            this.rectY1 = y(this.rectY)
        }
    }
}