import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'
import LeaderOrigin from '@/types/interfaces/LeaderOrigin'
import LeaderTarget from '@/types/interfaces/LeaderTarget'

export default class QueueLeaderLineItemBuilder extends QueueItemBaseBuilder<RenderItemLeaderLine> {
    constructor(origin: QueueItemBaseBuilder<RenderItemBase & LeaderOrigin>) {
        super(new RenderItemLeaderLine(origin.shape, origin.build()))

        this.fade(false)
    }

    gap(gap: number) {
        this.shape.gap = gap

        return this
    }

    length(length: number) {
        this.shape.length = length

        return this
    }

    offset(angle: number) {
        this.shape.offset = angle

        return this
    }

    anchor(angle: number) {
        this.shape.anchor = angle

        return this
    }

    target(target: QueueItemBaseBuilder<RenderItemBase & LeaderTarget>) {
        this.shape.target = target.shape
        this.shape.targetItem = target.build()

        return this
    }
}