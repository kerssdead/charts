import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { HorizontalAlignment, RenderStepType, VerticalAlignment } from '../static/Enums'
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

    round(corners?: number[] | null): QueueRectangleItemBuilder {
        this.current.rect.roundedCorners = corners ?? [16, 16, 16, 16]

        return this
    }

    align(x: HorizontalAlignment | null, y: VerticalAlignment | null) {
        this.current.rect.align = {
            x: x ?? HorizontalAlignment.Center,
            y: y ?? VerticalAlignment.Center
        }

        return this
    }
}