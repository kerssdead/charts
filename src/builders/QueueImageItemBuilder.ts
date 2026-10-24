import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemImage from '@/types/RenderItemImage'

export default class QueueImageItemBuilder
    extends QueueItemBaseBuilder<RenderItemImage> {
    constructor(url: string) {
        super(new RenderItemImage())

        this.shape.url = url
    }

    position(x: number, y: number) {
        this.shape.absolute = { x, y }

        return this
    }

    size(value: number) {
        this.shape.size = value

        return this
    }
}
