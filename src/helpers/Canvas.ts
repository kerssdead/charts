import Errors from 'helpers/Errors'
import { ErrorType } from 'static/Enums'
import Theme from 'Theme'

abstract class Canvas {
    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext('2d', { willReadFrequently: true })
               ?? Errors.throw(ErrorType.NullContext)
    }

    static isPixelBusy(pixel: number) {
        return pixel != undefined && pixel - Theme.canvasBackgroundInt != 0
    }
}

export default Canvas