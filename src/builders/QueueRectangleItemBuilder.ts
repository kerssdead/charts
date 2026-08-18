import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderStepType } from '../static/Enums'
import RenderItemRectangle from '../types/RenderItemRectangle'

export default class QueueRectangleItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.type = RenderStepType.Rect
        this.current.rect = new RenderItemRectangle()
    }

    position(x: number, y: number): QueueRectangleItemBuilder {
        this.current.rect.x = x
        this.current.rect.y = y

        return this
    }

    size(width: number, height: number): QueueRectangleItemBuilder {
        this.current.rect.width = width
        this.current.rect.height = height

        return this
    }

    fill(): QueueRectangleItemBuilder {
        this.current.rect.isFill = true

        return this
    }

    round(): QueueRectangleItemBuilder {
        this.current.rect.isRounded = true

        return this
    }

    animate(): QueueRectangleItemBuilder {
        this.current.rect.isAnimate = true

        return this
    }
}