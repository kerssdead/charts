import CellsRenderData from '@/types/CellsRenderData'
import RectangleDimensions from '@/types/RectangleDimensions'
import { createCanvas, getContext } from '@/helpers/Canvas'
import { getFontFamily } from '@/static/Typography'
import { TextAlignment, TextBaseline, TextDirection } from '@/static/Enums'

export type LabelAlpha = (index: number) => number

export type LabelsFrame = {
    box: RectangleDimensions
    getAlpha: LabelAlpha
    isChanging: boolean
}

const BASELINE_SHIFT = .3

export default class CellLabelsLayer {
    private layer: HTMLCanvasElement | null = null

    private readonly origin = { x: 0, y: 0 }

    private paintedKey: string | null = null

    render(ctx: CanvasRenderingContext2D, cells: CellsRenderData, { box, getAlpha, isChanging }: LabelsFrame) {
        if (cells.labels.length === 0)
            return

        const ratio = ctx.getTransform().a
        const key = `${ box.x }|${ box.y }|${ box.width }|${ box.height }|${ ratio }`

        if (isChanging || key !== this.paintedKey)
            this.paint(cells, box, ratio, getAlpha)

        this.paintedKey = isChanging ? null : key

        const layer = this.layer as HTMLCanvasElement

        ctx.drawImage(layer, this.origin.x, this.origin.y, layer.width / ratio, layer.height / ratio)
    }

    private paint(cells: CellsRenderData, box: RectangleDimensions, ratio: number, getAlpha: LabelAlpha) {
        const layer = this.layer ??= createCanvas()
        const left = Math.floor(box.x * ratio)
        const top = Math.floor(box.y * ratio)

        layer.width = Math.max(Math.ceil((box.x + box.width) * ratio) - left, 1)
        layer.height = Math.max(Math.ceil((box.y + box.height) * ratio) - top, 1)

        this.origin.x = left / ratio
        this.origin.y = top / ratio

        const ctx = getContext(layer)

        ctx.setTransform(ratio, 0, 0, ratio, -left, -top)
        ctx.font = `${ cells.labelSize }px ${ getFontFamily() }`
        ctx.direction = TextDirection.LeftToRight
        ctx.textAlign = TextAlignment.Center
        ctx.textBaseline = TextBaseline.Alphabetic

        const cellWidth = box.width / cells.columns
        const cellHeight = box.height / cells.rows
        const shift = cells.labelSize * BASELINE_SHIFT

        cells.labels.forEach((label, index) => {
            const alpha = label ? getAlpha(index) : 0

            if (!label || alpha <= 0)
                return

            ctx.globalAlpha = alpha
            ctx.fillStyle = label.color
            ctx.fillText(
                label.text,
                box.x + (index % cells.columns + .5) * cellWidth,
                box.y + (Math.floor(index / cells.columns) + .5) * cellHeight + shift
            )
        })
    }
}