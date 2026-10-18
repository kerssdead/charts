import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemArc from '@/types/RenderItemArc'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder<RenderItemArc> {
    constructor() {
        super(new RenderItemArc())
    }

    position(x: number, y: number): QueueArcItemBuilder {
        this.shape.absolute = { x: x, y: y }

        return this
    }

    radius(radius: number) : QueueArcItemBuilder {
        this.shape.radius = radius

        return this
    }

    innerRadius(radius: number) : QueueArcItemBuilder {
        this.shape.innerRadius = radius

        return this
    }

    gap(gap: number) : QueueArcItemBuilder {
        this.shape.gap = gap

        return this
    }

    cornerRadius(radius: number) : QueueArcItemBuilder {
        this.shape.cornerRadius = radius

        return this
    }

    startAngle(angle: number) : QueueArcItemBuilder {
        this.shape.startAngle = angle

        return this
    }

    endAngle(angle: number) : QueueArcItemBuilder {
        this.shape.endAngle = angle

        return this
    }

    leader(gap: number, length: number, offset: number = 0) : QueueArcItemBuilder {
        this.shape.leaderGap = gap
        this.shape.leaderLength = length
        this.shape.leaderOffset = offset

        return this
    }

    gradient() : QueueArcItemBuilder {
        this.shape.isGradient = true

        return this
    }

    grow(angle: number) : QueueArcItemBuilder {
        this.shape.growOrigin = angle

        return this
    }

    fill(isFill: boolean = true) : QueueArcItemBuilder {
        this.shape.isFill = isFill

        return this
    }
}