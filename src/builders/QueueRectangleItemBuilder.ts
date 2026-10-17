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
        this.current.rect.absolute.x = x
        this.current.rect.absolute.y = y

        return this
    }

    size(width: number, height: number): QueueRectangleItemBuilder {
        this.current.rect.absolute.width = width
        this.current.rect.absolute.height = height

        return this
    }

    fill(): QueueRectangleItemBuilder {
        this.current.rect.isFill = true

        return this
    }

    gradient(): QueueRectangleItemBuilder {
        this.current.rect.isGradient = true

        return this
    }

    round(radii?: number[] | null): QueueRectangleItemBuilder {
        this.current.rect.radii = radii ?? [16, 16, 16, 16]

        return this
    }

    align(x: HorizontalAlignment | null, y: VerticalAlignment | null) {
        this.current.rect.align = {
            x: x ?? HorizontalAlignment.Center,
            y: y ?? VerticalAlignment.Center
        }

        return this
    }

    collapse(width: boolean, height: boolean): QueueRectangleItemBuilder {
        this.current.rect.collapse = { width, height }

        return this
    }

    grow(axis: 'x' | 'y', origin: number): QueueRectangleItemBuilder {
        this.current.rect.growAxis = axis
        this.current.rect.growOrigin = origin

        return this
    }
}