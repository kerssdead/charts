import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import RenderItemRectangle from '@/types/RenderItemRectangle'

export default class QueueRectangleItemBuilder extends QueueItemBaseBuilder<RenderItemRectangle> {
    constructor() {
        super(new RenderItemRectangle())
    }

    position(x: number, y: number): QueueRectangleItemBuilder {
        this.shape.absolute.x = x
        this.shape.absolute.y = y

        return this
    }

    size(width: number, height: number): QueueRectangleItemBuilder {
        this.shape.absolute.width = width
        this.shape.absolute.height = height

        return this
    }

    fill(): QueueRectangleItemBuilder {
        this.shape.isFill = true

        return this
    }

    gradient(): QueueRectangleItemBuilder {
        this.shape.isGradient = true

        return this
    }

    round(radii?: number[] | null): QueueRectangleItemBuilder {
        this.shape.radii = radii ?? [16, 16, 16, 16]

        return this
    }

    align(x: HorizontalAlignment | null, y: VerticalAlignment | null) {
        this.shape.align = {
            x: x ?? HorizontalAlignment.Center,
            y: y ?? VerticalAlignment.Center
        }

        return this
    }

    collapse(width: boolean, height: boolean): QueueRectangleItemBuilder {
        this.shape.collapse = { width, height }

        return this
    }

    grow(axis: 'x' | 'y', origin: number): QueueRectangleItemBuilder {
        this.shape.growAxis = axis
        this.shape.growOrigin = origin

        return this
    }
}