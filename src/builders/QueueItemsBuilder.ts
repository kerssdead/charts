import QueueItemBuilder from './QueueItemBuilder'
import RenderItem from '../types/RenderItem'
import QueueLineItemBuilder from './QueueLineItemBuilder'
import QueueRectangleItemBuilder from './QueueRectangleItemBuilder'

export default class QueueItemsBuilder {
    private items: RenderItem[] = []

    private current: QueueItemBuilder | null = null

    dispose() {
        this.add()

        return this.items
    }

    line(): QueueLineItemBuilder {
        this.add()

        let builder = new QueueLineItemBuilder()

        this.current = builder

        return builder
    }

    rect(): QueueRectangleItemBuilder {
        this.add()

        let builder = new QueueRectangleItemBuilder()

        this.current = builder

        return builder
    }

    private add() {
        if (this.current == null) {
            return
        }

        this.items.push(this.current.dispose())
    }
}