import fail from '@/helpers/Errors'
import { ErrorType, Tag } from '@/static/Enums'
import Theme from '@/Theme'
import { adjustColor, withAlpha } from '@/helpers/Color'
import Styles from '@/static/constants/Styles'

const GRADIENT_DELTA = 20

const gradientStops = new Map<string, [string, string]>()

type GradientFactory = (ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) => CanvasGradient

export class GradientCache {
    private readonly createGradient: GradientFactory

    private key: string | null = null

    private gradient: CanvasGradient | null = null

    constructor(createGradient: GradientFactory = verticalGradient) {
        this.createGradient = createGradient
    }

    get(ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) {
        const key = `${ color }|${ y1 }|${ y2 }`

        if (key != this.key || !this.gradient) {
            this.key = key
            this.gradient = this.createGradient(ctx, color, y1, y2)
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

export function fadingGradient(ctx: CanvasRenderingContext2D, color: string, y1: number, y2: number) {
    const gradient = ctx.createLinearGradient(0, Math.min(y1, y2), 0, Math.max(y1, y2))

    gradient.addColorStop(0, color)
    gradient.addColorStop(1, withAlpha(color, 0))

    return gradient
}

const OPAQUE = '#000000ff'

const TRANSPARENT = '#00000000'

const MAX_EDGE_FADE_RATIO = 0.5

export function edgeFadeMask(ctx: CanvasRenderingContext2D, x1: number, x2: number, fade: number) {
    const gradient = ctx.createLinearGradient(x1, 0, x2, 0)
    const ratio = Math.min(fade / Math.max(x2 - x1, 1), MAX_EDGE_FADE_RATIO)

    gradient.addColorStop(0, TRANSPARENT)
    gradient.addColorStop(ratio, OPAQUE)
    gradient.addColorStop(1 - ratio, OPAQUE)
    gradient.addColorStop(1, TRANSPARENT)

    return gradient
}

const offscreenLayers = new WeakMap<CanvasRenderingContext2D, CanvasRenderingContext2D>()

export function offscreenLayer(ctx: CanvasRenderingContext2D) {
    let layer = offscreenLayers.get(ctx)

    if (!layer) {
        layer = getContext(createCanvas())
        offscreenLayers.set(ctx, layer)
    }

    const { width, height } = ctx.canvas

    if (layer.canvas.width != width)
        layer.canvas.width = width

    if (layer.canvas.height != height)
        layer.canvas.height = height

    return layer
}

const UNIT_GRADIENT_LIMIT = 256

const unitGradients = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>()

export function unitVerticalGradient(ctx: CanvasRenderingContext2D, color: string) {
    let gradients = unitGradients.get(ctx)

    if (!gradients) {
        gradients = new Map()
        unitGradients.set(ctx, gradients)
    }

    let gradient = gradients.get(color)

    if (!gradient) {
        if (gradients.size >= UNIT_GRADIENT_LIMIT)
            gradients.clear()

        gradient = verticalGradient(ctx, color, 0, 1)
        gradients.set(color, gradient)
    }

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