import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import { HorizontalAlignment, VerticalAlignment, Axis, FadeEdge } from '@/static/Enums'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'

export default class QueueRectangleItemBuilder extends QueueItemBaseBuilder<RenderItemRectangle> {
    constructor() {
        super(new RenderItemRectangle())
    }

    position(x: number, y: number) {
        return this.chain(() => {
            this.shape.absolute.x = x
            this.shape.absolute.y = y
        })
    }

    size(width: number, height: number) {
        return this.chain(() => {
            this.shape.absolute.width = width
            this.shape.absolute.height = height
        })
    }

    box(units: Units, { x, y, width, height }: RectangleDimensions) {
        return this.position(units.positionX(x), units.positionY(y))
                   .size(units.x(width), units.y(height))
                   .align(HorizontalAlignment.Left, VerticalAlignment.Top)
    }

    fill() {
        return this.chain(() => this.shape.isFill = true)
    }

    gradient() {
        return this.chain(() => this.shape.isGradient = true)
    }

    fadeEdge(edge: FadeEdge) {
        return this.chain(() => this.shape.fadeEdge = edge)
    }

    round(radii: number | number[]) {
        return this.chain(() => this.shape.radii = typeof radii == 'number' ? Array(4).fill(radii) : radii)
    }

    align(x: HorizontalAlignment, y: VerticalAlignment) {
        return this.chain(() => this.shape.align = { x, y })
    }

    clip(box: RectangleDimensions, radius: number) {
        return this.chain(() => this.shape.clip = { ...box, radius })
    }

    collapse(width: boolean, height: boolean) {
        return this.chain(() => this.shape.collapse = { width, height })
    }

    grow(axis: Axis, origin: number) {
        return this.chain(() => {
            this.shape.growAxis = axis
            this.shape.growOrigin = origin
        })
    }
}