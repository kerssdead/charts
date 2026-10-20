import fail from '@/helpers/Errors'
import { ErrorType, Tag } from '@/static/Enums'
import Theme from '@/Theme'
import { adjustColor } from '@/helpers/Color'
import Styles from '@/static/constants/Styles'

const GRADIENT_DELTA = 20

const gradientStops = new Map<string, [string, string]>()

export class GradientCache {
    private key: string | null = null

    private gradient: CanvasGradient | null = null

    get(ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) {
        const key = `${ color }|${ y1 }|${ y2 }`

        if (key != this.key || !this.gradient) {
            this.key = key
            this.gradient = verticalGradient(ctx, color, y1, y2)
        }

        return this.gradient
    }
}

export function verticalGradient(ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) {
    let stops = gradientStops.get(color)

    if (!stops) {
        const base = color.slice(0, 7)
        const alpha = color.slice(7)

        stops = [adjustColor(base, GRADIENT_DELTA) + alpha, adjustColor(base, -GRADIENT_DELTA) + alpha]

        gradientStops.set(color, stops)
    }

    const gradient = ctx.createLinearGradient(0, Math.min(y1, y2), 0, Math.max(y1, y2))

    gradient.addColorStop(0, stops[0])
    gradient.addColorStop(1, stops[1])

    return gradient
}

export function getContext(canvas: HTMLCanvasElement, willReadFrequently: boolean = false): CanvasRenderingContext2D {
    return canvas.getContext('2d', { willReadFrequently })
           ?? fail(ErrorType.NullContext)
}

export function isPixelBusy(pixel: number) {
    return pixel != undefined && pixel !== Theme.canvasBackgroundInt
}

export function createCanvas() {
    const canvas = document.createElement(Tag.Canvas)
    canvas.width = 0
    canvas.height = 0
    canvas.style.display = Styles.Display.Block

    return canvas
}