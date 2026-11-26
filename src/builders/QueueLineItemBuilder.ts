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
        return this.chain(() => {
            this.shape.absolute.push({ x, y })

            if (tooltip !== undefined)
                this.shape.tooltips.push(tooltip)
        })
    }

    width(width: number) {
        return this.chain(() => this.shape.width = width)
    }

    dash(segments: number[]) {
        return this.chain(() => this.shape.dash = segments)
    }

    drawMode(mode?: LineDrawMode) {
        return this.chain(() => this.shape.pathTracer = new LinePathTracer(mode))
    }

    area(baseline: number) {
        return this.chain(() => this.shape.area.baseline = baseline)
    }

    clip(box: RectangleDimensions) {
        return this.chain(() => this.shape.clip = box)
    }

    gradient() {
        return this.chain(() => this.shape.isGradient = true)
    }
}