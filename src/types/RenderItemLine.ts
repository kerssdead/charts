import Point from './Point'
import RenderItemBase from './interfaces/RenderItemBase'
import CanvasWindow from './CanvasWindow'
import RenderItem from './RenderItem'

export default class RenderItemLine
    implements RenderItemBase {
    stops: Point[] = []

    // todo: meh solution
    stops1: Point[] = []

    width: number = 1

    dash: number[] = []

    from: Point[] | null = null

    current(morph: number = 1): Point[] {
        if (!this.from || morph >= 1 || this.from.length != this.stops.length)
            return this.stops.map(stop => ({ x: stop.x, y: stop.y }))

        return this.stops.map((stop, i) => {
            const from = this.from![i]

            return {
                x: from.x + (stop.x - from.x) * morph,
                y: from.y + (stop.y - from.y) * morph
            }
        })
    }

    adjust(window: CanvasWindow, morph: number = 1): void {
        this.stops1 = []

        for (let stop of this.current(morph)) {
            this.stops1.push({ x: RenderItem.adjustX(window, stop.x), y: RenderItem.adjustY(window, stop.y) })
        }
    }

    render(ctx: CanvasRenderingContext2D, _window?: CanvasWindow, item?: RenderItem): void {
        const progress = item?.animation.init ?? 1

        if (this.stops1.length == 0 || progress <= 0) {
            return
        }

        ctx.lineWidth = this.width
        ctx.setLineDash(this.dash)

        const stops = progress < 1
                      ? this.partial(progress)
                      : this.stops1

        ctx.moveTo(stops[0].x, stops[0].y)

        for (const stop of stops.slice(1)) {
            ctx.lineTo(stop.x, stop.y)
        }

        ctx.stroke()
    }

    // todo: implement
    animate(item: RenderItem, isBackward: boolean): void {
    }

    // todo: implement
    tooltip(item: RenderItem, point: Point) {
        return false
    }

    // todo: implement
    contextMenu(item: RenderItem, point: Point): boolean {
        return false
    }

    // todo: implement
    isMouseOver(point: Point): boolean {
        return false
    }

    private partial(progress: number): Point[] {
        const lengths = this.stops1.slice(1).map((stop, i) => {
            return Math.hypot(stop.x - this.stops1[i].x, stop.y - this.stops1[i].y)
        })

        let left = lengths.reduce((acc, length) => { return acc + length }, 0) * progress

        const result: Point[] = [this.stops1[0]]

        for (let i = 0; i < lengths.length; i++) {
            const from = this.stops1[i]
            const to = this.stops1[i + 1]

            if (left >= lengths[i]) {
                result.push(to)
                left -= lengths[i]

                continue
            }

            const k = lengths[i] == 0 ? 0 : left / lengths[i]

            result.push({
                x: from.x + (to.x - from.x) * k,
                y: from.y + (to.y - from.y) * k
            })

            break
        }

        return result
    }
}