import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import Rectangle from '@/helpers/Rectangle'
import { createCanvas, getContext } from '@/helpers/Canvas'
import { sampleLevels } from '@/helpers/FieldSampling'
import FieldRenderData from '@/types/FieldRenderData'
import FieldMorph from '@/helpers/FieldMorph'
import FieldReveal from '@/helpers/FieldReveal'
import { diffuse } from '@/helpers/FieldBlur'
import FieldLife from '@/helpers/FieldLife'
import { clamp } from '@/helpers/Geometry'

export type FieldLookup = (u: number, v: number) => string | null

const BITMAP_DOWNSCALE = 2

const BITMAP_MAX_SIZE = 1024

export default class RenderItemField extends RenderItemBase {
    box: RectangleDimensions = Rectangle.empty()

    field: FieldRenderData | null = null

    lookup: FieldLookup = () => null

    private readonly canvasBox = Rectangle.empty()

    private readonly life = new FieldLife()

    private readonly morphing = new FieldMorph()

    private readonly reveal = new FieldReveal()

    private layer: HTMLCanvasElement | null = null

    private image: ImageData | null = null

    private levels: Uint8Array = new Uint8Array(0)

    private morph = 1

    private paintedReveal = NaN

    private paintedMorph = NaN

    private paintedFrame = -1

    adjust(window: CanvasWindow, morph = 1) {
        this.morph = morph

        window.mapBox(this.box, this.canvasBox)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem) {
        const { x, y, width, height } = this.canvasBox

        if (!this.field || width < 1 || height < 1)
            return

        const layer = this.paint(
            clamp(Math.ceil(width / BITMAP_DOWNSCALE), 1, BITMAP_MAX_SIZE),
            clamp(Math.ceil(height / BITMAP_DOWNSCALE), 1, BITMAP_MAX_SIZE),
            this.field,
            item.animation.init
        )

        ctx.imageSmoothingEnabled = true
        ctx.drawImage(layer, x, y, width, height)
    }

    animateHover(point: Point | null, now: DOMHighResTimeStamp, isInstant = false) {
        if (!this.field?.alive || !this.field.diffusion || isInstant) {
            this.life.stop()

            return false
        }

        const { x, y, width, height } = this.canvasBox

        this.life.tick(now, point && { u: (point.x - x) / width, v: (point.y - y) / height })

        return true
    }

    morphFrom(previous: RenderItemBase, morph: number) {
        if (!(previous instanceof RenderItemField) || !previous.field || !this.field)
            return false

        this.morphing.capture(previous.morphing, previous.field, morph, this.field)

        return true
    }

    getBounds() {
        return Rectangle.toBounds(this.canvasBox)
    }

    isMouseOver(point: Point) {
        return Rectangle.contains(this.canvasBox, point)
    }

    tooltipAt(point: Point): string | null {
        const { x, y, width, height } = this.canvasBox

        return this.lookup((point.x - x) / width, (point.y - y) / height)
    }

    private paint(width: number, height: number, source: FieldRenderData, reveal: number) {
        const canvas = this.layer ??= createCanvas()

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height

            this.levels = sampleLevels(source, width, height, source.lut.length)
            this.reveal.measure(this.levels, source.lut.length)
            this.image = getContext(canvas).createImageData(width, height)
            this.paintedReveal = NaN
        }

        const isPainted = reveal === this.paintedReveal
                          && this.morph === this.paintedMorph
                          && this.life.frame === this.paintedFrame

        if (isPainted || !this.image)
            return canvas

        this.paintedReveal = reveal
        this.paintedMorph = this.morph
        this.paintedFrame = this.life.frame

        const { levels, lut } = this.getLevels(width, height, source, reveal)
        const pixels = new Uint32Array(this.image.data.buffer)

        for (let index = 0; index < pixels.length; index++)
            pixels[index] = lut[levels[index]]

        getContext(canvas).putImageData(this.image, 0, 0)

        return canvas
    }

    private getLevels(width: number, height: number, source: FieldRenderData, reveal: number) {
        const { diffusion, lut } = source
        const levelsOf = (field: FieldRenderData) => sampleLevels(field, width, height, lut.length)

        if (this.morphing.hasSource && this.morph < 1)
            return { levels: levelsOf(this.morphing.blend(source, this.morph)), lut }

        if (diffusion && this.life.isActive && reveal >= 1)
            return { levels: levelsOf({ ...source, values: this.life.getValues(source, diffusion) }), lut }

        if (!diffusion)
            return { levels: this.levels, lut: this.reveal.getLut(lut, reveal) }

        if (reveal >= 1)
            return { levels: this.levels, lut }

        return { levels: levelsOf({ ...source, values: diffuse(diffusion, reveal, source) }), lut }
    }
}