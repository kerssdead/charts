import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderGroupDirection } from '../static/Enums'
import QueueItemsBuilder from './QueueItemsBuilder'
import Margin from '../types/Margin'
import RenderItemGroup from '../types/RenderItemGroup'

export default class QueueGroupItemBuilder extends QueueItemBaseBuilder {
    constructor() {
        super()

        this.current.group = new RenderItemGroup()
    }

    gap(unit: number): QueueGroupItemBuilder {
        this.current.group.gap = unit

        return this
    }

    direction(direction: RenderGroupDirection): QueueGroupItemBuilder {
        this.current.group.direction = direction

        return this
    }

    items(action: (builder: QueueItemsBuilder) => void): QueueGroupItemBuilder {
        const builder = new QueueItemsBuilder()

        action(builder)

        this.current.group.items = this.current.group.items.concat(builder.dispose())

        return this
    }

    margin(margin: Margin): QueueGroupItemBuilder {
        this.current.group.margin = margin

        return this
    }
}