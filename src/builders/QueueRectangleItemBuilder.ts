import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'

export default class QueueRectangleItemBuilder extends QueueItemBaseBuilder<RenderItemRectangle> {
    constructor() {
        super(new RenderItemRectangle())
    }

    position(x: number, y: number) {
        this.shape.absolute.x = x
        this.shape.absolute.y = y

        return this
    }

    size(width: number, height: number) {
        this.shape.absolute.width = width
        this.shape.absolute.height = height

        return this
    }

    box(units: Units, { x, y, width, height }: RectangleDimensions) {
        return this.position(units.positionX(x), units.positionY(y))
                   .size(units.x(width), units.y(height))
                   .align(HorizontalAlignment.Left, VerticalAlignment.Top)
    }

    fill() {
        this.shape.isFill = true

        return this
    }

    gradient() {
        this.shape.isGradient = true

        return this
    }

    round(radii: number | number[]) {
        this.shape.radii = typeof radii == 'number' ? Array(4).fill(radii) : radii

        return this
    }

    align(x: HorizontalAlignment, y: VerticalAlignment) {
        this.shape.align = { x, y }

        return this
    }

    collapse(width: boolean, height: boolean) {
        this.shape.collapse = { width, height }

        return this
    }

    grow(axis: 'x' | 'y', origin: number) {
        this.shape.growAxis = axis
        this.shape.growOrigin = origin

        return this
    }
}