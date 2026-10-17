import QueueItemBaseBuilder from 'builders/QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'
import RenderItemArc from '../types/RenderItemArc'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.Arc
        this.current.arc = new RenderItemArc()
    }

    position(x: number, y: number): QueueArcItemBuilder {
        this.current.arc.x = x
        this.current.arc.y = y

        return this
    }

    radius(radius: number) : QueueArcItemBuilder {
        this.current.arc.radius = radius

        return this
    }

    innerRadius(radius: number) : QueueArcItemBuilder {
        this.current.arc.innerRadius = radius

        return this
    }

    gap(gap: number) : QueueArcItemBuilder {
        this.current.arc.gap = gap

        return this
    }

    cornerRadius(radius: number) : QueueArcItemBuilder {
        this.current.arc.cornerRadius = radius

        return this
    }

    startAngle(angle: number) : QueueArcItemBuilder {
        this.current.arc.startAngle = angle

        return this
    }

    endAngle(angle: number) : QueueArcItemBuilder {
        this.current.arc.endAngle = angle

        return this
    }

    leader(gap: number, length: number, offset: number = 0) : QueueArcItemBuilder {
        this.current.arc.leaderGap = gap
        this.current.arc.leaderLength = length
        this.current.arc.leaderOffset = offset

        return this
    }

    gradient() : QueueArcItemBuilder {
        this.current.arc.isGradient = true

        return this
    }

    grow(angle: number) : QueueArcItemBuilder {
        this.current.arc.growOrigin = angle

        return this
    }

    fill(isFill: boolean = true) : QueueArcItemBuilder {
        this.current.arc.isFill = isFill

        return this
    }
}