import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItem from '@/types/RenderItem'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueArcItemBuilder from '@/builders/QueueArcItemBuilder'
import QueueTextItemBuilder from '@/builders/QueueTextItemBuilder'

export type QueueAction = (items: QueueItemsBuilder) => void

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

    private next<T extends QueueItemBaseBuilder>(builder: T): T {
        this.add()

        this.current = builder

        return builder
    }

    line() {
        return this.next(new QueueLineItemBuilder())
    }

    rect() {
        return this.next(new QueueRectangleItemBuilder())
    }

    arc() {
        return this.next(new QueueArcItemBuilder())
    }

    text(text: string) {
        return this.next(new QueueTextItemBuilder(text))
    }

    static build(actions: QueueAction | QueueAction[], isInitialized: boolean = false) {
        const builder = new QueueItemsBuilder(isInitialized)

        for (const action of Array.isArray(actions) ? actions : [actions])
            action(builder)

        return builder.dispose()
    }

    static readonly empty: QueueAction = () => { }

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