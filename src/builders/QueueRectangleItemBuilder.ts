import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'

export default class QueueRectangleItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.Rect
    }

    position(x: number, y: number): QueueRectangleItemBuilder {
        this.current.rectX = x
        this.current.rectY = y

        return this
    }

    size(width: number, height: number): QueueRectangleItemBuilder {
        this.current.rectWidth = width
        this.current.rectHeight = height

        return this
    }

    fill(): QueueRectangleItemBuilder {
        this.current.isFill = true

        return this
    }

    round(): QueueRectangleItemBuilder {
        this.current.isRounded = true

        return this
    }
}