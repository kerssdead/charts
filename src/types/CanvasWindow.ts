import { COORDS_MAX_X, COORDS_MAX_Y, ZOOM_MAX, ZOOM_MIN } from 'static/constants/Index'
import Point from 'types/Point'

export default class CanvasWindow {
    x: number = 0

    y: number = 0

    width: number

    height: number

    zoomValue: number = 1

    private isNeedNormalize = false

    get pixel(): Point {
        return {
            x: COORDS_MAX_X / this.width,
            y: COORDS_MAX_Y / this.height
        }
    }

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    in(step: number, xRatio: number, yRatio: number) {
        if (this.zoomValue > ZOOM_MAX) {
            return
        }

        this.zoom(step, xRatio, yRatio)
    }

    out(step: number, xRatio: number, yRatio: number) {
        if (this.zoomValue < ZOOM_MIN) {
            return
        }

        this.zoom(step, xRatio, yRatio)
    }

    private zoom(step: number, xRatio: number = -1, yRatio: number = -1) {
        this.isNeedNormalize = true

        this.zoomValue += step

        const widthDiff = step * this.width
        const heightDiff = step * this.height

        this.width -= widthDiff
        this.height -= heightDiff

        this.move(widthDiff / 2 + widthDiff * xRatio,
            heightDiff / 2 + heightDiff * yRatio)

        this.normalize()
    }

    move(x: number = 0, y: number = 0) {
        this.isNeedNormalize = true

        this.x += x
        this.y += y

        this.normalize()
    }

    moveTo(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    private normalize() {
        if (!this.isNeedNormalize) {
            return
        }

        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        this.width = Math.round(this.width)
        this.height = Math.round(this.height)

        this.isNeedNormalize = false
    }
}