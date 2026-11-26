import fail from '@/helpers/Errors'
import { AriaRole, Attribute, ErrorType, FadeEdge, Tag } from '@/static/Enums'
import RectangleDimensions from '@/types/RectangleDimensions'
import { adjustColor, withAlpha } from '@/helpers/Color'
import Styles from '@/static/constants/Styles'
import Rectangle from '@/helpers/Rectangle'

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

        if (key !== this.key || !this.gradient) {
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

export function capFadeGradient(
    ctx: CanvasRenderingContext2D,
    color: string,
    edge: FadeEdge,
    box: RectangleDimensions
) {
    const { x, y, width, height } = box
    const gradient = edge === FadeEdge.Top
                     ? ctx.createLinearGradient(0, y, 0, y + height)
                     : ctx.createLinearGradient(x + width, 0, x, 0)

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

export function clipRoundedRectUnlessBoxInside(
    ctx: CanvasRenderingContext2D,
    clip: RectangleDimensions,
    radius: number,
    box: RectangleDimensions
) {
    if (Rectangle.containsRoundedBox(clip, radius, box))
        return false

    ctx.save()

    clipToBoxArea(ctx, box)

    ctx.roundRect(clip.x, clip.y, clip.width, clip.height, radius)
    ctx.clip()

    ctx.beginPath()

    return true
}

function clipToBoxArea(ctx: CanvasRenderingContext2D, box: RectangleDimensions) {
    const margin = ctx.lineWidth
    const left = Math.min(box.x, box.x + box.width) - margin
    const top = Math.min(box.y, box.y + box.height) - margin

    ctx.rect(left, top, Math.abs(box.width) + margin * 2, Math.abs(box.height) + margin * 2)
    ctx.clip()

    ctx.beginPath()
}

let sharedLayer: CanvasRenderingContext2D | null = null

export function offscreenLayer(width: number, height: number) {
    sharedLayer ??= getContext(createCanvas())

    const { canvas } = sharedLayer

    if (canvas.width < width)
        canvas.width = width

    if (canvas.height < height)
        canvas.height = height

    return sharedLayer
}

export function releaseOffscreenLayer() {
    if (!sharedLayer)
        return

    sharedLayer.canvas.width = 0
    sharedLayer.canvas.height = 0
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

export function getContext(
    canvas: HTMLCanvasElement,
    willReadFrequently: boolean = false
): CanvasRenderingContext2D {
    return canvas.getContext('2d', { willReadFrequently })
           ?? fail(ErrorType.NullContext)
}

export function isPixelBusy(pixel: number, canvasBackgroundInt: number) {
    return pixel !== undefined && pixel !== canvasBackgroundInt
}

export function renewBuffers(canvas: HTMLCanvasElement) {
    const { width } = canvas

    if (width === 0)
        return

    canvas.width = 0
    canvas.width = width
}

export function createCanvas() {
    const canvas = document.createElement(Tag.Canvas)
    canvas.width = 0
    canvas.height = 0
    canvas.style.display = Styles.Display.Block
    canvas.setAttribute(Attribute.Role, AriaRole.Img)

    return canvas
}