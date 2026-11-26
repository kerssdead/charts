import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemArc from '@/types/RenderItemArc'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder<RenderItemArc> {
    constructor() {
        super(new RenderItemArc())
    }

    position(x: number, y: number) {
        return this.chain(() => this.shape.absolute = { x, y })
    }

    radius(radius: number) {
        return this.chain(() => this.shape.radius = radius)
    }

    innerRadius(radius: number) {
        return this.chain(() => this.shape.innerRadius = radius)
    }

    gap(gap: number) {
        return this.chain(() => this.shape.gap = gap)
    }

    cornerRadius(radius: number) {
        return this.chain(() => this.shape.cornerRadius = radius)
    }

    startAngle(angle: number) {
        return this.chain(() => this.shape.startAngle = angle)
    }

    endAngle(angle: number) {
        return this.chain(() => this.shape.endAngle = angle)
    }

    pull(distance: number) {
        return this.chain(() => this.shape.pull = distance)
    }

    gradient() {
        return this.chain(() => this.shape.isGradient = true)
    }

    grow(angle: number) {
        return this.chain(() => this.shape.growOrigin = angle)
    }

    fill(isFill = true) {
        return this.chain(() => this.shape.isFill = isFill)
    }
}