import { Errors } from './Errors'
import { ErrorType } from '../static/Enums'
import { Theme } from '../Theme'

export abstract class Canvas {
    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext('2d', { willReadFrequently: true })
               ?? Errors.throw(ErrorType.NullContext)
    }

    static isPixelBusy(pixel: number) {
        return pixel - Theme.canvasBackgroundInt != 0
    }
}