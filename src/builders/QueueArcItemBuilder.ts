import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemArc from '@/types/RenderItemArc'

export default class QueueArcItemBuilder extends QueueItemBaseBuilder<RenderItemArc> {
    constructor() {
        super(new RenderItemArc())
    }

    position(x: number, y: number) {
        this.shape.absolute = { x, y }

        return this
    }

    radius(radius: number) {
        this.shape.radius = radius

        return this
    }

    innerRadius(radius: number) {
        this.shape.innerRadius = radius

        return this
    }

    gap(gap: number) {
        this.shape.gap = gap

        return this
    }

    cornerRadius(radius: number) {
        this.shape.cornerRadius = radius

        return this
    }

    startAngle(angle: number) {
        this.shape.startAngle = angle

        return this
    }

    endAngle(angle: number) {
        this.shape.endAngle = angle

        return this
    }

    leader(gap: number, length: number, offset: number = 0, anchor: number = 0) {
        this.shape.leaderGap = gap
        this.shape.leaderLength = length
        this.shape.leaderOffset = offset
        this.shape.leaderAnchor = anchor

        return this
    }

    gradient() {
        this.shape.isGradient = true

        return this
    }

    grow(angle: number) {
        this.shape.growOrigin = angle

        return this
    }

    fill(isFill: boolean = true) {
        this.shape.isFill = isFill

        return this
    }
}