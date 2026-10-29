import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemLine from '@/types/RenderItemLine'

export default class QueueLineItemBuilder extends QueueItemBaseBuilder<RenderItemLine> {
    constructor() {
        super(new RenderItemLine())
    }

    stop(x: number, y: number, tooltip?: string) {
        this.shape.absolute.push({ x, y })

        if (tooltip != undefined)
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

    area(baseline: number) {
        this.shape.areaBaseline = baseline

        return this
    }

    gradient() {
        this.shape.isGradient = true

        return this
    }
}