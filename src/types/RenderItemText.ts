import CanvasWindow from './CanvasWindow';
import RenderItemBase from './interfaces/RenderItemBase'
import Point from './Point'
import RenderItem from './RenderItem'
import {TextAlignment, TextBaseline} from '../static/Enums'

export default class RenderItemText
    implements RenderItemBase {
    value: string

    x: number

    y: number

    // todo: meh solution
    x1: number

    // todo: meh solution
    y1: number

    fontSize: number = 14

    rotate: number = 0

    alignment: TextAlignment = TextAlignment.Center

    baseline: TextBaseline = TextBaseline.Alphabetic

    private get font(): string {
        return `${this.fontSize}px Arial`
    }

    from: Point | null = null

    current(morph: number = 1): Point {
        if (!this.from || morph >= 1)
            return { x: this.x, y: this.y }

        return {
            x: this.from.x + (this.x - this.from.x) * morph,
            y: this.from.y + (this.y - this.from.y) * morph
        }
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        const position = this.current(morph)

        this.x1 = RenderItem.adjustX(window, position.x) - this.fontSize / 2
        this.y1 = RenderItem.adjustY(window, position.y) + this.fontSize * 0.3
    }

    // todo: remove "window" arg ?
    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow): void {
        ctx.font = this.font
        ctx.textAlign = this.alignment
        ctx.textBaseline = this.baseline as CanvasTextBaseline

        if (this.rotate != 0) {
            ctx.save()

            if (this.baseline == TextBaseline.Alphabetic) {
                // todo: adjust formula for various this.rotate
                this.x1 = this.x1 - this.fontSize / 2
            }

            ctx.translate(this.x1, this.y1)
            ctx.rotate(this.rotate * Math.PI / 180)

            ctx.fillText(this.value, 0, 0)

            ctx.restore()
        } else {
            ctx.fillText(this.value, this.x1, this.y1)
        }
    }

    animate(item: RenderItem, isBackward: boolean, point: Point): void {
        // todo
    }

    // todo: implement
    tooltip(item: RenderItem, point: Point) {
        return false
    }

    // todo: implement
    contextMenu(item: RenderItem, point: Point): boolean {
        return false
    }

    isMouseOver(point: Point): boolean {
        // todo
        return false
    }
}