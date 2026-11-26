import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItem from '@/types/RenderItem'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueArcItemBuilder from '@/builders/QueueArcItemBuilder'
import QueueTextItemBuilder from '@/builders/QueueTextItemBuilder'
import QueueImageItemBuilder from '@/builders/QueueImageItemBuilder'
import QueueFieldItemBuilder from '@/builders/QueueFieldItemBuilder'
import QueueCellsItemBuilder from '@/builders/QueueCellsItemBuilder'
import QueueLeaderLineItemBuilder from '@/builders/QueueLeaderLineItemBuilder'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import LeaderOrigin from '@/types/interfaces/LeaderOrigin'

export type QueueAction = (items: QueueItemsBuilder) => void

export default class QueueItemsBuilder {
    private items: RenderItem[] = []

    private current: QueueItemBaseBuilder | null = null

    constructor(private readonly isInitialized: boolean = false) {
    }

    build() {
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

    leaderLine(origin: QueueItemBaseBuilder<RenderItemBase & LeaderOrigin>) {
        return this.next(new QueueLeaderLineItemBuilder(origin))
    }

    text(text: string) {
        return this.next(new QueueTextItemBuilder(text))
    }

    field() {
        return this.next(new QueueFieldItemBuilder())
    }

    cells() {
        return this.next(new QueueCellsItemBuilder())
    }

    image(url: string) {
        return this.next(new QueueImageItemBuilder(url))
    }

    static build(actions: QueueAction | QueueAction[], isInitialized = false) {
        const builder = new QueueItemsBuilder(isInitialized)

        for (const action of Array.isArray(actions) ? actions : [actions])
            action(builder)

        return builder.build()
    }

    static readonly empty: QueueAction = () => { }

    private add() {
        if (this.current == null) {
            return
        }

        const item = this.current.build()

        if (this.isInitialized) {
            item.animation.init = 1
            item.animation.initDuration = 0
            item.animation.initFade = false
        }

        this.items.push(item)
    }
}