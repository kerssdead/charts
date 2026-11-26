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
        return this.chain(() => this.shape.gap = gap)
    }

    length(length: number) {
        return this.chain(() => this.shape.length = length)
    }

    offset(angle: number) {
        return this.chain(() => this.shape.offset = angle)
    }

    anchor(angle: number) {
        return this.chain(() => this.shape.anchor = angle)
    }

    target(target: QueueItemBaseBuilder<RenderItemBase & LeaderTarget>) {
        return this.chain(() => {
            this.shape.target = target.shape
            this.shape.targetItem = target.build()
        })
    }
}