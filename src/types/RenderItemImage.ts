import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import { COORDS_MAX_X, FULL_ANGLE } from '@/static/constants/Index'
import { getImage } from '@/helpers/Images'
import { ImageCrossOrigin } from '@/static/Enums'
import { lerp } from '@/helpers/Geometry'
import RectangleDimensions from '@/types/RectangleDimensions'
import Rectangle from '@/helpers/Rectangle'

type ImageCanvas = Point & {
    size: number
}

export default class RenderItemImage extends RenderItemBase {
    url: string

    crossOrigin: ImageCrossOrigin | undefined

    absolute: Point = { x: 0, y: 0 }

    size: number = 0

    from: Point | null = null

    box: RectangleDimensions | null = null

    private canvas: ImageCanvas = { x: 0, y: 0, size: 0 }

    private readonly canvasBox = Rectangle.empty()

    constructor(url: string) {
        super()

        this.url = url
    }

    current(morph: number = 1): Point {
        if (!this.from || morph >= 1)
            return { ...this.absolute }

        return {
            x: lerp(this.from.x, this.absolute.x, morph),
            y: lerp(this.from.y, this.absolute.y, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number): boolean {
        if (!(previous instanceof RenderItemImage))
            return false

        this.from = previous.current(morph)

        return true
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const position = this.current(morph)

        this.canvas.x = window.mapX(position.x)
        this.canvas.y = window.mapY(position.y)
        this.canvas.size = this.size / COORDS_MAX_X * window.width

        if (this.box)
            window.mapBox(this.box, this.canvasBox)
    }

    canBeCached(): boolean {
        return getImage(this.url, this.crossOrigin) != null
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.box) {
            this.renderBox(ctx)

            return
        }

        const { x, y, size } = this.canvas

        ctx.arc(x, y, size / 2, 0, FULL_ANGLE)

        const image = getImage(this.url, this.crossOrigin)

        if (!image) {
            ctx.fill()

            return
        }

        const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight)
        const width = image.naturalWidth * scale
        const height = image.naturalHeight * scale

        ctx.save()
        ctx.clip()
        ctx.drawImage(image, x - width / 2, y - height / 2, width, height)
        ctx.restore()
    }

    private renderBox(ctx: CanvasRenderingContext2D) {
        const image = getImage(this.url, this.crossOrigin)

        if (image)
            ctx.drawImage(image, this.canvasBox.x, this.canvasBox.y, this.canvasBox.width, this.canvasBox.height)
    }

    getBounds() {
        if (this.box)
            return Rectangle.toBounds(this.canvasBox)

        const { x, y, size } = this.canvas

        return { left: x - size / 2, top: y - size / 2, right: x + size / 2, bottom: y + size / 2 }
    }

    isMouseOver(point: Point): boolean {
        return Math.hypot(point.x - this.canvas.x, point.y - this.canvas.y) <= this.canvas.size / 2
    }
}