import CanvasWindow from './CanvasWindow'
import RenderItemBase from './interfaces/RenderItemBase'
import RenderItem from './RenderItem'
import { COORDS_MAX_X } from 'static/constants/Index'
import Point from './Point'
import Errors from '../helpers/Errors'
import { ErrorType } from '../static/Enums'

type ArcGeometry = {
    x: number
    y: number
    radius: number
    startAngle: number
    endAngle: number
}

export default class RenderItemArc implements RenderItemBase {
    from: ArcGeometry | null = null

    current(morph: number = 1): ArcGeometry {
        const result = {
            x: this.x,
            y: this.y,
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        }

        if (!this.from || morph >= 1)
            return result

        const lerp = (from: number, to: number) => {
            return from + (to - from) * morph
        }

        return {
            x: lerp(this.from.x, result.x),
            y: lerp(this.from.y, result.y),
            radius: lerp(this.from.radius, result.radius),
            startAngle: lerp(this.from.startAngle, result.startAngle),
            endAngle: lerp(this.from.endAngle, result.endAngle)
        }
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const geometry = this.current(morph)

        this.x1 = RenderItem.adjustX(window, geometry.x)
        this.y1 = RenderItem.adjustY(window, geometry.y)

        this.radius1 = geometry.radius * (window.width / COORDS_MAX_X)

        this.startAngle1 = geometry.startAngle
        this.endAngle1 = geometry.endAngle
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.arc(
            this.x1,
            this.y1,
            this.radius1,
            this.startAngle1,
            this.endAngle1
        )

        ctx.lineTo(this.x1, this.y1)
        ctx.closePath()

        if (this.isFill) {
            ctx.fill()
        }

        ctx.stroke()
    }

    getBounds() {
        const radius = Math.abs(this.radius1)

        return {
            left: this.x1 - radius,
            top: this.y1 - radius,
            right: this.x1 + radius,
            bottom: this.y1 + radius
        }
    }

    // todo: implement
    animate(item: RenderItem, isBackward: boolean): void {
    }

    // todo: implement
    tooltip(item: RenderItem, point: Point) {
        return false
    }

    // todo: implement
    contextMenu(item: RenderItem, point: Point): boolean {
        return false
    }

    // todo: implement
    isMouseOver(point: Point): boolean {
        return false
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

    startAngle1: number = 0

    endAngle1: number = Math.PI * 2
}