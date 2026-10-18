import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemLine from '@/types/RenderItemLine'

export default class QueueLineItemBuilder extends QueueItemBaseBuilder<RenderItemLine> {
    constructor() {
        super(new RenderItemLine())
    }

    stop(x: number, y: number) {
        this.shape.absolute.push({ x, y })

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
}