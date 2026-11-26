import { unitVerticalGradient, verticalGradient } from '@/helpers/Canvas'

export default class RectangleGradient {
    private lastColor: string | null = null

    private lastTop: number = NaN

    private lastHeight: number = NaN

    private stableGradient: CanvasGradient | null = null

    private isContextSaved = false

    apply(ctx: CanvasRenderingContext2D, color: string, top: number, height: number) {
        if (this.isSameAsLast(color, top, height)) {
            this.stableGradient ??= verticalGradient(ctx, color, top, top + height)
            ctx.fillStyle = ctx.strokeStyle = this.stableGradient

            return
        }

        this.rememberLast(color, top, height)

        const scale = Math.abs(height)

        ctx.save()
        this.isContextSaved = true

        ctx.translate(0, Math.min(top, top + height))
        ctx.scale(scale, scale)

        ctx.lineWidth /= scale
        ctx.fillStyle = ctx.strokeStyle = unitVerticalGradient(ctx, color)
    }

    restore(ctx: CanvasRenderingContext2D) {
        if (!this.isContextSaved)
            return

        ctx.restore()
        this.isContextSaved = false
    }

    private isSameAsLast(color: string, top: number, height: number) {
        return color === this.lastColor && top === this.lastTop && height === this.lastHeight
    }

    private rememberLast(color: string, top: number, height: number) {
        this.lastColor = color
        this.lastTop = top
        this.lastHeight = height
        this.stableGradient = null
    }
}