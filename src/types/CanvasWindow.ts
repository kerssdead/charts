import { COORDS_MAX_X, COORDS_MAX_Y, PAN_MIN_VISIBLE, ZOOM_MAX, ZOOM_MIN } from '@/static/constants/Index'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import { clamp } from '@/Helper'

export default class CanvasWindow {
    x: number = 0

    y: number = 0

    width: number

    height: number

    private scale: number = 1

    private base: RectangleDimensions

    get baseWidth() {
        return this.base.width
    }

    get baseHeight() {
        return this.base.height
    }

    get pixel(): Point {
        return {
            x: COORDS_MAX_X / this.base.width,
            y: COORDS_MAX_Y / this.base.height
        }
    }

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.base = { x: 0, y: 0, width, height }
    }

    fit(x: number, y: number, width: number, height: number): boolean {
        const isResized = width != this.base.width || height != this.base.height
        const offsetX = this.x - this.base.x
        const offsetY = this.y - this.base.y

        this.base = { x, y, width, height }
        this.width = Math.round(width * this.scale)
        this.height = Math.round(height * this.scale)

        this.moveTo(x + offsetX, y + offsetY)

        return isResized
    }

    zoom(step: number, anchor: Point) {
        const scale = clamp(this.scale * (1 + step), ZOOM_MIN, ZOOM_MAX)

        if (scale == this.scale)
            return

        const ratio = scale / this.scale

        this.scale = scale
        this.width = Math.round(this.base.width * scale)
        this.height = Math.round(this.base.height * scale)

        this.moveTo(anchor.x - (anchor.x - this.x) * ratio,
            anchor.y - (anchor.y - this.y) * ratio)
    }

    moveTo(x: number, y: number) {
        const keepX = Math.min(this.width, this.base.width) * PAN_MIN_VISIBLE
        const keepY = Math.min(this.height, this.base.height) * PAN_MIN_VISIBLE

        const { base } = this

        this.x = Math.round(clamp(x, base.x - this.width + keepX, base.x + base.width - keepX))
        this.y = Math.round(clamp(y, base.y - this.height + keepY, base.y + base.height - keepY))
    }
}