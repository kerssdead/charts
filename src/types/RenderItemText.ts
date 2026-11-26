import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import { TextAlignment, TextBaseline, TextDirection } from '@/static/Enums'
import RenderItemArc from '@/types/RenderItemArc'
import { boxEdgeDistance, clamp, lerp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import { getFontFamily } from '@/static/Typography'
import { ThemePalette } from '@/Theme'
import LeaderTarget, { LeaderBox } from '@/types/interfaces/LeaderTarget'

export type Orbit = {
    x: number
    y: number
    radiusX: number
    radiusY: number
}

const CLIP_FACTOR = {
    [TextAlignment.Left]: 0,
    [TextAlignment.Center]: .5,
    [TextAlignment.Right]: 1
}

type TextCanvas = Point & {
    angle: number
    radius: number
    orbitHalfWidth: number
}

export default class RenderItemText extends RenderItemBase implements LeaderTarget {
    absolute: Point = { x: 0, y: 0 }

    canvas: TextCanvas = { x: 0, y: 0, angle: 0, radius: 0, orbitHalfWidth: 0 }

    fontSize = 14

    rotate = 0

    alignment: TextAlignment = TextAlignment.Center

    baseline: TextBaseline = TextBaseline.Alphabetic

    private get font() {
        return `${this.fontSize}px ${getFontFamily()}`
    }

    from: Point | null = null

    orbit: Orbit | null = null

    angle = 0

    fromAngle: number | null = null

    fromOrbitHalfWidth: number | null = null

    follow: RenderItemArc | null = null

    clipWidth: number | null = null

    private canvasClipWidth = 0

    private halfWidth: number | null = null

    private window!: CanvasWindow

    constructor(public value: string) {
        super()
    }

    defaultColor(theme: ThemePalette) {
        return theme.text
    }

    private get baselineShift() {
        return this.orbit || this.baseline !== TextBaseline.Alphabetic ? 0 : this.fontSize * 0.3
    }

    private get textHalfWidth() {
        return this.halfWidth ??= stringWidth(this.value, this.fontSize) / 2
    }

    private currentOrbitHalfWidth(morph: number) {
        if (this.fromOrbitHalfWidth == null || morph >= 1)
            return this.textHalfWidth

        return lerp(this.fromOrbitHalfWidth, this.textHalfWidth, morph)
    }

    currentAngle(morph = 1) {
        return this.fromAngle == null || morph >= 1 ? this.angle : lerp(this.fromAngle, this.angle, morph)
    }

    current(morph = 1): Point {
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

    morphFrom(previous: RenderItemBase, morph: number) {
        if (!(previous instanceof RenderItemText))
            return false

        this.from = previous.current(morph)
        this.fromAngle = previous.orbit ? previous.currentAngle(morph) : null
        this.fromOrbitHalfWidth = this.orbit && previous.orbit ? previous.currentOrbitHalfWidth(morph) : null

        return true
    }

    enterFromAxis(y: number) {
        this.from = { x: this.absolute.x, y }

        return true
    }

    leaveToAxis(y: number, morph: number) {
        this.from = this.current(morph)
        this.absolute.y = y

        return true
    }

    adjust(window: CanvasWindow, morph = 1) {
        const position = this.current(morph)

        this.window = window
        this.canvas.angle = this.currentAngle(morph)
        this.canvas.radius = window.scaleX(this.orbit?.radiusX ?? 0)
        this.canvasClipWidth = window.scaleX(this.clipWidth ?? 0)

        this.canvas.x = window.mapX(position.x)
        this.canvas.y = window.mapY(position.y) + (this.rotate === 0 ? this.baselineShift : 0)

        if (this.orbit)
            this.canvas.orbitHalfWidth = this.currentOrbitHalfWidth(morph)

        if (this.follow) {
            this.canvas.x += this.follow.pop.x
            this.canvas.y += this.follow.pop.y
        }
    }

    leaderBox(window: CanvasWindow, morph: number): LeaderBox {
        this.adjust(window, morph)

        return this.orbitBox()
    }

    orbitBox() {
        const halfWidth = this.textHalfWidth
        const halfHeight = this.fontSize / 2
        const { angle, orbitHalfWidth, radius } = this.canvas
        const distance = boxEdgeDistance(angle, orbitHalfWidth, halfHeight, radius)
        const pieEdgeShift = Math.sign(Math.cos(this.angle)) * (halfWidth - orbitHalfWidth)

        return {
            x: clamp(
                this.canvas.x + distance * Math.cos(angle) + pieEdgeShift,
                this.window.x + halfWidth,
                this.window.x + this.window.width - halfWidth
            ),
            y: clamp(
                this.canvas.y + distance * Math.sin(angle),
                this.window.y + halfHeight,
                this.window.y + this.window.height - halfHeight
            ),
            halfWidth,
            halfHeight
        }
    }

    getDependencies(): RenderItemBase[] {
        return this.follow ? [this.follow] : []
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.font = this.font
        ctx.direction = TextDirection.LeftToRight
        ctx.textAlign = this.alignment
        ctx.textBaseline = this.baseline

        if (this.rotate !== 0) {
            ctx.save()

            ctx.translate(this.canvas.x, this.canvas.y)
            ctx.rotate(this.rotate)

            ctx.fillText(this.value, 0, this.baselineShift)

            ctx.restore()
        } else if (this.orbit) {
            const { x, y } = this.orbitBox()

            ctx.textAlign = TextAlignment.Center
            ctx.textBaseline = TextBaseline.Middle
            ctx.fillText(this.value, x, y)
        } else if (this.clipWidth != null) {
            ctx.save()

            ctx.rect(
                this.canvas.x - this.canvasClipWidth * CLIP_FACTOR[this.alignment],
                this.canvas.y - this.fontSize,
                this.canvasClipWidth,
                this.fontSize * 2
            )
            ctx.clip()

            ctx.fillText(this.value, this.canvas.x, this.canvas.y)

            ctx.restore()
        } else {
            ctx.fillText(this.value, this.canvas.x, this.canvas.y)
        }
    }
}