namespace Helpers {
    export class Canvas {
        static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
            return canvas.getContext('2d', { willReadFrequently: true })
                ?? Helpers.Errors.throw(ErrorType.NullContext)
        }
    }
}