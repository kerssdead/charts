import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItem from '@/types/RenderItem'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueArcItemBuilder from '@/builders/QueueArcItemBuilder'
import QueueTextItemBuilder from '@/builders/QueueTextItemBuilder'

type BuilderConstructor<T extends QueueItemBaseBuilder> = new (...args: any[]) => T

export default class QueueItemsBuilder {
    private items: RenderItem[] = []

    private current: QueueItemBaseBuilder | null = null

    private readonly isInitialized: boolean

    constructor(isInitialized: boolean = false) {
        this.isInitialized = isInitialized
    }

    dispose() {
        this.add()

        return this.items
    }

    private getBuilder<T extends QueueItemBaseBuilder>(BuilderClass: BuilderConstructor<T>, ...args: any[]): T {
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

    static build(actions: ((builder: QueueItemsBuilder) => void)[], isInitialized: boolean = false) {
        const builder = new QueueItemsBuilder(isInitialized)

        for (const action of actions)
            action(builder)

        return builder.dispose()
    }

    static readonly empty = (_items: QueueItemsBuilder) => { }

    private add() {
        if (this.current == null) {
            return
        }

        const item = this.current.dispose()

        if (this.isInitialized) {
            item.animation.init = 1
            item.animation.initDuration = 0
            item.animation.initFade = false
        }

        this.items.push(item)
    }
}