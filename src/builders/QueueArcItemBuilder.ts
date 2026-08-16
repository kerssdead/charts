import QueueItemBaseBuilder from 'builders/QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'
import RenderItemArc from '../types/RenderItemArc'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.ArcTo
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

    startAngle(angle: number) : QueueArcItemBuilder {
        this.current.arc.startAngle = angle

        return this
    }

    endAngle(angle: number) : QueueArcItemBuilder {
        this.current.arc.endAngle = angle

        return this
    }

    fill(isFill: boolean = true) : QueueArcItemBuilder {
        this.current.arc.isFill = isFill

        return this
    }
}