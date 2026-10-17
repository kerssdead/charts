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

    baseline: TextBaseline = TextBaseline.Alphabetic

    private get font(): string {
        return `${this.fontSize}px Arial`
    }

    from: Point | null = null

    orbit: Orbit | null = null

    angle: number = 0

    fromAngle: number | null = null

    follow: RenderItemArc | null = null

    private angle1: number = 0

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
            return { x: this.x, y: this.y }

        return {
            x: this.from.x + (this.x - this.from.x) * morph,
            y: this.from.y + (this.y - this.from.y) * morph
        }
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const position = this.current(morph)

        this.angle1 = this.currentAngle(morph)

        this.x1 = RenderItem.adjustX(window, position.x) - (this.orbit ? 0 : this.fontSize / 2)
        this.y1 = RenderItem.adjustY(window, position.y) + (this.rotate == 0 ? this.baselineShift : 0)

        if (this.follow) {
            this.x1 += this.follow.pop.x
            this.y1 += this.follow.pop.y
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.font = this.font
        ctx.textAlign = this.alignment
        ctx.textBaseline = this.baseline as CanvasTextBaseline

        if (this.rotate != 0) {
            ctx.save()

            ctx.translate(this.x1, this.y1)
            ctx.rotate(this.rotate * Math.PI / 180)

            ctx.fillText(this.value, 0, this.baselineShift)

            ctx.restore()
        } else if (this.orbit) {
            this.halfWidth ??= stringWidth(this.value, this.fontSize) / 2

            const distance = boxEdgeDistance(this.angle1, this.halfWidth, this.fontSize / 2)

            ctx.textAlign = TextAlignment.Center
            ctx.textBaseline = TextBaseline.Middle as CanvasTextBaseline
            ctx.fillText(this.value,
                this.x1 + distance * Math.cos(this.angle1),
                this.y1 + distance * Math.sin(this.angle1))
        } else {
            ctx.fillText(this.value, this.x1, this.y1)
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