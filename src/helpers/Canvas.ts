import Errors from 'helpers/Errors'
import { ErrorType } from 'static/Enums'
import Theme from 'Theme'
import * as Helper from 'Helper'

abstract class Canvas {
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
}

export default Canvas