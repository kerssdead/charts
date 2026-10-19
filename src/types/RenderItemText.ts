import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import RenderItemArc from '@/types/RenderItemArc'
import { boxEdgeDistance, lerp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import { FONT_FAMILY } from '@/static/constants/Index'
import Theme from '@/Theme'

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
    extends RenderItemBase {
    value: string

    absolute: Point = { x: 0, y: 0 }

    canvas: TextCanvas = { x: 0, y: 0, angle: 0 }

    fontSize: number = 14

    rotate: number = 0

    alignment: TextAlignment = TextAlignment.Center

    baseline: TextBaseline = TextBaseline.Alphabetic

    private get font(): string {
        return `${this.fontSize}px ${FONT_FAMILY}`
    }

    from: Point | null = null

    orbit: Orbit | null = null

    angle: number = 0

    fromAngle: number | null = null

    follow: RenderItemArc | null = null

    private halfWidth: number | null = null

    get defaultColor(): string {
        return Theme.text
    }

    private get baselineShift(): number {
        return this.orbit ? 0 : this.fontSize * 0.3
    }

    currentAngle(morph: number = 1): number {
        if (this.fromAngle == null || morph >= 1)
            return this.angle

        return lerp(this.fromAngle, this.angle, morph)
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
            x: lerp(this.from.x, this.absolute.x, morph),
            y: lerp(this.from.y, this.absolute.y, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemText))
            return false

        this.from = previous.current(morph)
        this.fromAngle = previous.orbit ? previous.currentAngle(morph) : null

        return true
    }

    enterFromAxis(y: number): boolean {
        this.from = { x: this.absolute.x, y }

        return true
    }

    leaveToAxis(y: number, morph: number): boolean {
        this.from = this.current(morph)
        this.absolute.y = y

        return true
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const position = this.current(morph)

        this.canvas.angle = this.currentAngle(morph)

        this.canvas.x = RenderItem.adjustX(window, position.x)
        this.canvas.y = RenderItem.adjustY(window, position.y) + (this.rotate == 0 ? this.baselineShift : 0)

        if (this.follow) {
            this.canvas.x += this.follow.pop.x
            this.canvas.y += this.follow.pop.y
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.font = this.font
        ctx.textAlign = this.alignment
        ctx.textBaseline = this.baseline

        if (this.rotate != 0) {
            ctx.save()

            ctx.translate(this.canvas.x, this.canvas.y)
            ctx.rotate(this.rotate)

            ctx.fillText(this.value, 0, this.baselineShift)

            ctx.restore()
        } else if (this.orbit) {
            this.halfWidth ??= stringWidth(this.value, this.fontSize) / 2

            const distance = boxEdgeDistance(this.canvas.angle, this.halfWidth, this.fontSize / 2)

            ctx.textAlign = TextAlignment.Center
            ctx.textBaseline = TextBaseline.Middle
            ctx.fillText(this.value,
                this.canvas.x + distance * Math.cos(this.canvas.angle),
                this.canvas.y + distance * Math.sin(this.canvas.angle))
        } else {
            ctx.fillText(this.value, this.canvas.x, this.canvas.y)
        }
    }
}