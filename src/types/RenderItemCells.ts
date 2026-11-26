import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import ItemData from '@/types/ItemData'
import RectangleDimensions from '@/types/RectangleDimensions'
import CellsRenderData from '@/types/CellsRenderData'
import Rectangle from '@/helpers/Rectangle'
import CellsHover from '@/helpers/CellsHover'
import CellLabelsLayer from '@/helpers/CellLabelsLayer'
import ease from '@/animation/Animations'
import { createCanvas, getContext } from '@/helpers/Canvas'
import { blendPacked, getPackedAlpha, scalePackedAlpha } from '@/helpers/PackedColor'
import { clamp } from '@/helpers/Geometry'
import { AnimationTiming } from '@/static/constants/Index'

export type CellLookup<T> = (index: number) => T | null

type MorphSource = {
    box: RectangleDimensions
    colors: Uint32Array
}

const CELL_SHARE = AnimationTiming.heatMapInit / (AnimationTiming.heatMapInit + AnimationTiming.heatMapRipple)

export default class RenderItemCells extends RenderItemBase {
    box: RectangleDimensions = Rectangle.empty()

    cells: CellsRenderData | null = null

    lookup: CellLookup<string> = () => null

    dataLookup: CellLookup<ItemData> = () => null

    private readonly canvasBox = Rectangle.empty()

    private readonly hover = new CellsHover()

    private readonly labels = new CellLabelsLayer()

    private from: MorphSource | null = null

    private layer: HTMLCanvasElement | null = null

    private image: ImageData | null = null

    private morph = 1

    private paintedInit = NaN

    private paintedMorph = NaN

    private paintedHover = -1

    adjust(window: CanvasWindow, morph = 1) {
        this.morph = morph

        window.mapBox(this.currentBox(), this.canvasBox)
    }

    render(ctx: CanvasRenderingContext2D, item: RenderItem) {
        const { x, y, width, height } = this.canvasBox

        if (!this.cells || width < 1 || height < 1)
            return

        const { init } = item.animation

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(this.paint(this.cells, init), x, y, width, height)
        ctx.imageSmoothingEnabled = true

        this.labels.render(ctx, this.cells, {
            box: this.canvasBox,
            getAlpha: index => this.getReveal(index, init),
            isChanging: init < 1 || this.morph < 1
        })
    }

    animateHover(point: Point | null, now: DOMHighResTimeStamp, isInstant = false) {
        return this.hover.step(point && this.indexAt(point), now, isInstant)
    }

    morphFrom(previous: RenderItemBase, morph: number) {
        if (!(previous instanceof RenderItemCells) || !previous.cells || !this.cells)
            return false

        const { columns, rows } = this.cells
        const colors = new Uint32Array(columns * rows)

        for (let row = 0; row < rows; row++)
            for (let column = 0; column < columns; column++) {
                const u = (column + .5) / columns
                const v = (row + .5) / rows

                colors[row * columns + column] = previous.colorAt(u, v, morph)
            }

        this.from = { box: previous.currentBox(morph), colors }

        return true
    }

    getBounds() {
        return Rectangle.toBounds(this.canvasBox)
    }

    isMouseOver(point: Point) {
        return this.indexAt(point) !== null
    }

    tooltipAt(point: Point): string | null {
        const index = this.indexAt(point)

        return index === null ? null : this.lookup(index)
    }

    dataAt(point: Point): ItemData | null {
        const index = this.indexAt(point)

        return index === null ? null : this.dataLookup(index)
    }

    private indexAt(point: Point) {
        const { x, y, width, height } = this.canvasBox

        if (!this.cells || !Rectangle.contains(this.canvasBox, point))
            return null

        const { columns, rows, colors } = this.cells
        const column = clamp(Math.floor((point.x - x) / width * columns), 0, columns - 1)
        const row = clamp(Math.floor((point.y - y) / height * rows), 0, rows - 1)
        const index = row * columns + column

        return getPackedAlpha(colors[index]) > 0 ? index : null
    }

    private currentBox(morph: number = this.morph) {
        return this.from && morph < 1 ? Rectangle.lerp(this.from.box, this.box, morph) : this.box
    }

    private colorAt(u: number, v: number, morph: number) {
        const { columns, rows } = this.cells as CellsRenderData
        const column = clamp(Math.floor(u * columns), 0, columns - 1)
        const row = clamp(Math.floor(v * rows), 0, rows - 1)

        return this.getColor(row * columns + column, morph)
    }

    private getColor(index: number, morph: number) {
        const color = (this.cells as CellsRenderData).colors[index]

        return this.from && morph < 1 ? blendPacked(this.from.colors[index], color, morph) : color
    }

    private getReveal(index: number, init: number) {
        if (init >= 1)
            return 1

        const delay = (this.cells as CellsRenderData).delays[index] * (1 - CELL_SHARE)

        return ease(clamp((init - delay) / CELL_SHARE, 0, 1))
    }

    private paint(cells: CellsRenderData, init: number) {
        const canvas = this.layer ??= createCanvas()
        const { columns, rows } = cells

        if (canvas.width !== columns || canvas.height !== rows) {
            canvas.width = columns
            canvas.height = rows

            this.image = getContext(canvas).createImageData(columns, rows)
            this.paintedInit = NaN
        }

        const isPainted = init === this.paintedInit
                          && this.morph === this.paintedMorph
                          && this.hover.version === this.paintedHover

        if (isPainted || !this.image)
            return canvas

        this.paintedInit = init
        this.paintedMorph = this.morph
        this.paintedHover = this.hover.version

        const pixels = new Uint32Array(this.image.data.buffer)

        for (let index = 0; index < pixels.length; index++)
            pixels[index] = scalePackedAlpha(
                this.getColor(index, this.morph),
                this.getReveal(index, init) * this.hover.getAlpha(index)
            )

        getContext(canvas).putImageData(this.image, 0, 0)

        return canvas
    }
}