import RenderItem from '../types/RenderItem'

export default class QueueItemBaseBuilder {
    protected current: RenderItem

    constructor() {
        this.current = new RenderItem()
    }

    /**
     * Returns configured item.
     *
     * @returns {RenderItem}
     */
    dispose(): RenderItem {
        return this.current
    }

    interact(): QueueItemBaseBuilder {
        return this
    }

    color(color: string): QueueItemBaseBuilder {
        this.current.color = color

        return this
    }
}