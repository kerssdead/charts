import { ZOOM_DEFAULT_STEP, ZOOM_MAX, ZOOM_MIN } from 'static/constants/Index'

export default class CanvasWindow {
    x: number = 0

    y: number = 0

    width: number

    height: number

    zoomValue: number = 1

    private isNeedNormalize = false

    constructor(canvas: HTMLCanvasElement) {
        const bounds = canvas.getBoundingClientRect()

        this.width = bounds.width
        this.height = bounds.height
    }

    in(step: number = ZOOM_DEFAULT_STEP, xRatio: number = 1, yRatio: number = 1) {
        if (this.zoomValue > ZOOM_MAX) {
            return
        }

        this.zoom(step, xRatio, yRatio)
    }

    out(step: number = -ZOOM_DEFAULT_STEP, xRatio: number = -1, yRatio: number = -1) {
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

        this.move(widthDiff * xRatio, heightDiff * yRatio)

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