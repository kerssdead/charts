import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemLine from '@/types/RenderItemLine'
import RectangleDimensions from '@/types/RectangleDimensions'
import { LineDrawMode } from '@/static/Enums'
import { Tooltip } from '@/types/Tooltip'
import LinePathTracer from '@/helpers/LinePathTracer'

export default class QueueLineItemBuilder extends QueueItemBaseBuilder<RenderItemLine> {
    constructor() {
        super(new RenderItemLine())
    }

    stop(x: number, y: number, tooltip?: Tooltip) {
        this.shape.absolute.push({ x, y })

        if (tooltip !== undefined)
            this.shape.tooltips.push(tooltip)

        return this
    }

    width(width: number) {
        this.shape.width = width

        return this
    }

    dash(segments: number[]) {
        this.shape.dash = segments

        return this
    }

    drawMode(mode?: LineDrawMode) {
        this.shape.pathTracer = new LinePathTracer(mode)

        return this
    }

    area(baseline: number) {
        this.shape.area.baseline = baseline

        return this
    }

    clip(box: RectangleDimensions) {
        this.shape.clip = box

        return this
    }

    gradient() {
        this.shape.isGradient = true

        return this
    }
}