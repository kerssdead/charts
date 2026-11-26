import { createCanvas, getContext } from '@/helpers/Canvas'

export default class CachedLayer {
    start = 0

    end = 0

    private canvas: HTMLCanvasElement | null = null

    private context: CanvasRenderingContext2D | null = null

    private version: number | null = null

    open(version: number, target: HTMLCanvasElement, ratio: number) {
        if (this.context && this.matches(version, target))
            return { ctx: this.context, isReset: false }

        return { ctx: this.reset(version, target, ratio), isReset: true }
    }

    private matches(version: number, target: HTMLCanvasElement) {
        return this.version === version
               && this.canvas?.width === target.width
               && this.canvas?.height === target.height
    }

    private reset(version: number, target: HTMLCanvasElement, ratio: number) {
        const canvas = this.canvas ??= createCanvas()
        const ctx = this.context ??= getContext(canvas)

        if (canvas.width !== target.width || canvas.height !== target.height) {
            canvas.width = target.width
            canvas.height = target.height
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        ctx.globalAlpha = 1

        this.version = version

        return ctx
    }

    drawTo(target: CanvasRenderingContext2D, ratio: number) {
        if (!this.canvas)
            return

        target.setTransform(1, 0, 0, 1, 0, 0)
        target.globalAlpha = 1
        target.drawImage(this.canvas, 0, 0)
        target.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    invalidate() {
        this.version = null
    }

    release() {
        this.invalidate()

        if (!this.canvas)
            return

        this.canvas.width = 0
        this.canvas.height = 0
    }
}