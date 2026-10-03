import QueueItemBuilder from './QueueItemBuilder'
import RenderItem from '../types/RenderItem'
import QueueLineItemBuilder from './QueueLineItemBuilder'
import QueueRectangleItemBuilder from './QueueRectangleItemBuilder'
import QueueGroupItemBuilder from './QueueGroupItemBuilder'
import QueueArcItemBuilder from './QueueArcItemBuilder'
import QueueTextItemBuilder from './QueueTextItemBuilder'

type BuilderConstructor<T extends QueueItemBuilder> = new (...args: any[]) => T

export default class QueueItemsBuilder {
    private items: RenderItem[] = []

    private current: QueueItemBuilder | null = null

    dispose() {
        this.add()

        return this.items
    }

    private getBuilder<T extends QueueItemBuilder>(BuilderClass: BuilderConstructor<T>, ...args: any[]): T {
        this.add()

        const builder = new BuilderClass(...args)

        this.current = builder

        return builder
    }

    line(): QueueLineItemBuilder {
        return this.getBuilder(QueueLineItemBuilder)
    }

    rect(): QueueRectangleItemBuilder {
        return this.getBuilder(QueueRectangleItemBuilder)
    }

    arc(): QueueArcItemBuilder {
        return this.getBuilder(QueueArcItemBuilder)
    }

    text(text: string): QueueTextItemBuilder {
        return this.getBuilder(QueueTextItemBuilder, text)
    }

    group(): QueueGroupItemBuilder {
        return this.getBuilder(QueueGroupItemBuilder)
    }

    static get empty() {
        return (items: QueueItemsBuilder) => { }
    }

    private add() {
        if (this.current == null) {
            return
        }

        this.items.push(this.current.dispose())
    }
}