import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'

export default class QueueLineItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.Line
    }

    stop(x: number, y: number) : QueueLineItemBuilder {
        this.current.stops.push({ x: x, y: y })

        return this
    }

    width(width: number) {
        this.current.width = width

        return this
    }
}