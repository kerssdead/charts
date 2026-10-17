import CanvasWindow from 'types/CanvasWindow';
import RenderItemBase from 'types/interfaces/RenderItemBase'
import Point from 'types/Point'
import RenderItem from 'types/RenderItem'
import {TextAlignment, TextBaseline} from 'static/Enums'
import RenderItemArc from 'types/RenderItemArc'
import { boxEdgeDistance, stringWidth } from 'Helper'

export type Orbit = {
    x: number
    y: number
    radiusX: number
    radiusY: number
}

type TextCanvas = Point & {
    angle: number
}

export default class RenderItemText
    implements RenderItemBase {
    value: string

    absolute: Point = { x: 0, y: 0 }

    canvas: TextCanvas = { x: 0, y: 0, angle: 0 }

    fontSize: number = 14

    rotate: number = 0

    alignment: TextAlignment = TextAlignment.Center

    baseline: TextBaseline = TextBaseline.Alphabetic

    private get font(): string {
        return `${this.fontSize}px Arial`
    }

    from: Point | null = null

    orbit: Orbit | null = null

    angle: number = 0

    fromAngle: number | null = null

    follow: RenderItemArc | null = null

    private halfWidth: number | null = null

    private get baselineShift(): number {
        return this.orbit ? 0 : this.fontSize * 0.3
    }

    currentAngle(morph: number = 1): number {
        if (this.fromAngle == null || morph >= 1)
            return this.angle

        return this.fromAngle + (this.angle - this.fromAngle) * morph
    }

    current(morph: number = 1): Point {
        if (this.orbit) {
            const angle = this.currentAngle(morph)

            return {
                x: this.orbit.x + this.orbit.radiusX * Math.cos(angle),
                y: this.orbit.y + this.orbit.radiusY * Math.sin(angle)
            }
        }

        if (!this.from || morph >= 1)
            return { x: this.absolute.x, y: this.absolute.y }

        return {
            x: this.from.x + (this.absolute.x - this.from.x) * morph,
            y: this.from.y + (this.absolute.y - this.from.y) * morph
        }
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const position = this.current(morph)

        this.canvas.angle = this.currentAngle(morph)

        this.canvas.x = RenderItem.adjustX(window, position.x) - (this.orbit ? 0 : this.fontSize / 2)
        this.canvas.y = RenderItem.adjustY(window, position.y) + (this.rotate == 0 ? this.baselineShift : 0)

        if (this.follow) {
            this.canvas.x += this.follow.pop.x
            this.canvas.y += this.follow.pop.y
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.font = this.font
        ctx.textAlign = this.alignment
        ctx.textBaseline = this.baseline as CanvasTextBaseline

        if (this.rotate != 0) {
            ctx.save()

            ctx.translate(this.canvas.x, this.canvas.y)
            ctx.rotate(this.rotate * Math.PI / 180)

            ctx.fillText(this.value, 0, this.baselineShift)

            ctx.restore()
        } else if (this.orbit) {
            this.halfWidth ??= stringWidth(this.value, this.fontSize) / 2

            const distance = boxEdgeDistance(this.canvas.angle, this.halfWidth, this.fontSize / 2)

            ctx.textAlign = TextAlignment.Center
            ctx.textBaseline = TextBaseline.Middle as CanvasTextBaseline
            ctx.fillText(this.value,
                this.canvas.x + distance * Math.cos(this.canvas.angle),
                this.canvas.y + distance * Math.sin(this.canvas.angle))
        } else {
            ctx.fillText(this.value, this.canvas.x, this.canvas.y)
        }
    }

    animate(_item: RenderItem, _isBackward: boolean, _point: Point): void {
    }

    tooltip(_item: RenderItem, _point: Point) {
        return false
    }

    contextMenu(_item: RenderItem, _point: Point): boolean {
        return false
    }

    isMouseOver(_point: Point): boolean {
        return false
    }
}