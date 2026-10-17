import Errors from 'helpers/Errors'
import { ErrorType, Tag } from 'static/Enums'
import Theme from 'Theme'
import * as Helper from 'Helper'

const GRADIENT_DELTA = 20

abstract class Canvas {
    private static readonly gradientStops = new Map<string, [string, string]>()

    static verticalGradient(ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) {
        let stops = Canvas.gradientStops.get(color)

        if (!stops) {
            const base = color.slice(0, 7)
            const alpha = color.slice(7)

            stops = [Helper.adjustColor(base, GRADIENT_DELTA) + alpha, Helper.adjustColor(base, -GRADIENT_DELTA) + alpha]

            Canvas.gradientStops.set(color, stops)
        }

        const gradient = ctx.createLinearGradient(0, Math.min(y1, y2), 0, Math.max(y1, y2))

        gradient.addColorStop(0, stops[0])
        gradient.addColorStop(1, stops[1])

        return gradient
    }

    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext('2d', { willReadFrequently: true })
               ?? Errors.throw(ErrorType.NullContext)
    }

    static isPixelBusy(pixel: number) {
        return pixel != undefined && pixel - Theme.canvasBackgroundInt != 0
    }

    static isCanRender(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number | string,
        h: number,
        isLeft?: boolean
    ) {
        const width = typeof w == 'number' ? w : Helper.stringWidth(w)

        if (width <= 0)
            return false

        const pos = !isLeft
                    ? { x: x - width / 2, y: y - h / 2 }
                    : { x: x, y: y + h / 2 }

        const imageData = isLeft
                          ? new Uint32Array(ctx.getImageData(pos.x - width, pos.y - h, width, h).data.buffer)
                          : new Uint32Array(ctx.getImageData(pos.x, pos.y, width, h).data.buffer)

        for (let i = 0; i < imageData.length; i++)
            if (Canvas.isPixelBusy(imageData[i]))
                return false

        return true
    }

    static new() {
        let canvas = document.createElement(Tag.Canvas)
        canvas.width = 0
        canvas.height = 0

        return canvas
    }
}

export default Canvas