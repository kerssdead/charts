import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'
import RenderItemLine from '../types/RenderItemLine'

export default class QueueLineItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.Line
        this.current.line = new RenderItemLine()
    }

    stop(x: number, y: number) : QueueLineItemBuilder {
        this.current.line.stops.push({ x: x, y: y })

        return this
    }

    width(width: number) {
        this.current.line.width = width

        return this
    }
}