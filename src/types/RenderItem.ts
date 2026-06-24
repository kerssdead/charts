import { RenderGroupDirection, RenderStepType } from '../static/Enums'
import Point from './Point'
import { COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from 'static/constants/Index'
import Margin from './Margin'
import CanvasWindow from './CanvasWindow'

export default class RenderItem {
    type: RenderStepType

    color: string

    layer: number = 0

    // todo: move line parameters to separate object
    // Line

    stops: Point[] = []

    // todo: meh solution
    stops1: Point[] = []

    width: number = 1

    // todo: move rectangle parameters to separate object
    // Rectangle

    isFill: boolean = false

    isRounded: boolean = false

    rectX: number = 0

    // todo: meh solution
    rectX1: number = 0

    rectY: number = 0

    // todo: meh solution
    rectY1: number = 0

    rectWidth: number = 1

    // todo: meh solution
    rectWidth1: number = 1

    rectHeight: number = 1

    // todo: meh solution
    rectHeight1: number = 1

    // todo: move arc parameters to separate object
    // Arc

    arcX: number = 0

    arcY: number = 0

    arcX1: number = 0

    arcY1: number = 0

    arcRadius: number = 10

    arcRadius1: number = 10

    arcStartAngle: number = 0

    arcEndAngle: number = Math.PI * 2

    // todo: move group parameters to separate object
    // Group

    isGroup: boolean = false

    groupGap: number = 0

    groupDirection: RenderGroupDirection = RenderGroupDirection.Row

    groupItems: RenderItem[] = []

    groupMargin: Margin | null

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow) {
        this.adjust(window)

        ctx.beginPath()

        ctx.lineWidth = DEFAULT_LINE_WIDTH

        ctx.fillStyle = this.color

        // todo: move to separate object resolver
        // todo: replace with this.is(Line)
        if (this.type == RenderStepType.Line) {
            ctx.strokeStyle = this.color
            ctx.lineWidth = this.width

            if (this.stops1) {
                ctx.moveTo(this.stops1[0].x, this.stops1[0].y)
            }

            for (const stop of this.stops1.slice(1)) {
                ctx.lineTo(stop.x, stop.y)
            }

            ctx.stroke()

            return
        }

        // todo: move to separate object resolver
        // todo: replace with this.is(Rectangle)
        if (this.type == RenderStepType.Rect) {
            const width = this.rectWidth1
            const height = this.rectHeight1

            const x = this.rectX1 - width / 2
            const y = this.rectY1 - height / 2

            if (this.isRounded) {
                ctx.roundRect(x, y, width, height)
            } else {
                ctx.rect(x, y, width, height)
            }

            if (this.isFill) {
                ctx.fill()
            }

            ctx.stroke()

            return
        }

        if (this.type == RenderStepType.ArcTo) {
            ctx.arc(
                this.arcX1,
                this.arcY1,
                this.arcRadius1,
                this.arcStartAngle,
                this.arcEndAngle
            )

            if (this.isFill) {
                ctx.fill()
            }

            ctx.stroke()

            return
        }

        // todo: move to separate object resolver
        // todo: replace with this.is(Group)
        if (this.isGroup) {
            const margin = this.groupMargin ?? new Margin()
            const itemsCount = this.groupItems.length

            const isRow = this.groupDirection.isAnyEquals(
                RenderGroupDirection.Row,
                RenderGroupDirection.RowReversed
            )
            const isColumn = this.groupDirection.isAnyEquals(
                RenderGroupDirection.Column,
                RenderGroupDirection.ColumnReversed
            )

            const itemSize =
                isRow
                ? Math.round((COORDS_MAX_X - this.groupGap * (itemsCount - 1) - margin.left - margin.right) / itemsCount)
                : Math.round((COORDS_MAX_Y - this.groupGap * (itemsCount - 1) - margin.top - margin.bottom) / itemsCount)

            const isReverse = this.groupDirection.isAnyEquals(
                RenderGroupDirection.RowReversed,
                RenderGroupDirection.ColumnReversed
            )

            if (isReverse) {
                this.groupItems.reverse()
            }

            let index = 0

            for (const item of this.groupItems) {
                switch (this.groupDirection) {
                    case RenderGroupDirection.Row:
                    case RenderGroupDirection.RowReversed:
                        item.rectX
                            = margin.left
                              + this.groupGap * index
                              + itemSize * index
                              + itemSize / 2
                        item.rectY
                            = COORDS_MAX_Y / 2
                        item.rectWidth
                            = itemSize
                        item.rectHeight
                            = COORDS_MAX_Y - margin.top - margin.bottom

                        break

                    case RenderGroupDirection.Column:
                    case RenderGroupDirection.ColumnReversed:
                        item.rectX
                            = COORDS_MAX_X / 2
                        item.rectY
                            = margin.top
                              + this.groupGap * index
                              + itemSize * index
                              + itemSize / 2
                        item.rectWidth
                            = COORDS_MAX_X - margin.left - margin.right
                        item.rectHeight
                            = itemSize

                        break
                }

                item.render(ctx, window)

                index++
            }

            if (isReverse) {
                this.groupItems.reverse()
            }

            return
        }
    }

    // todo: move adjust(...) to separate type params field class
    private adjust(window: CanvasWindow): void {
        function x(x: number) {
            return Math.round(x / COORDS_MAX_X * window.width + window.x)
        }

        function y(y: number) {
            return Math.round(y / COORDS_MAX_Y * window.height + window.y)
        }

        if (this.type == RenderStepType.Line) {
            this.stops1 = []

            for (let stop of this.stops) {
                this.stops1.push({ x: x(stop.x), y: y(stop.y) })
            }
        }

        if (this.type == RenderStepType.Rect) {
            this.rectX1 = x(this.rectX)
            this.rectY1 = y(this.rectY)
            this.rectWidth1 = this.rectWidth / COORDS_MAX_X * window.width
            this.rectHeight1 = this.rectHeight / COORDS_MAX_Y * window.height
        }

        if (this.type == RenderStepType.ArcTo) {
            this.arcX1 = x(this.arcX)
            this.arcY1 = y(this.arcY)
            this.arcRadius1 = this.arcRadius / window.zoomValue
        }
    }
}