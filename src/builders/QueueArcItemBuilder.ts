import QueueItemBaseBuilder from 'builders/QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.ArcTo
    }

    position(x: number, y: number): QueueArcItemBuilder {
        this.current.arcX = x
        this.current.arcY = y

        return this
    }

    radius(radius: number) : QueueArcItemBuilder {
        this.current.arcRadius = radius

        return this
    }

    startAngle(angle: number) : QueueArcItemBuilder {
        this.current.arcStartAngle = angle

        return this
    }

    endAngle(angle: number) : QueueArcItemBuilder {
        this.current.arcEndAngle = angle

        return this
    }

    fill(isFill: boolean = true) : QueueArcItemBuilder {
        this.current.isFill = isFill

        return this
    }
}