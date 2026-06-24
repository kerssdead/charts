import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderGroupDirection, RenderStepType } from '../static/Enums'
import QueueItemsBuilder from './QueueItemsBuilder'
import Margin from '../types/Margin'

export default class QueueGroupItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.isGroup = true
    }

    gap(unit: number): QueueGroupItemBuilder {
        this.current.groupGap = unit

        return this
    }

    direction(direction: RenderGroupDirection): QueueGroupItemBuilder {
        this.current.groupDirection = direction

        return this
    }

    items(action: (builder: QueueItemsBuilder) => void): QueueGroupItemBuilder {
        const builder = new QueueItemsBuilder()

        action(builder)

        this.current.groupItems = this.current.groupItems.concat(builder.dispose())

        return this
    }

    margin(margin: Margin): QueueGroupItemBuilder {
        this.current.groupMargin = margin

        return this
    }
}