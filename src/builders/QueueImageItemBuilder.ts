import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemImage from '@/types/RenderItemImage'
import { ImageCrossOrigin } from '@/static/Enums'

export default class QueueImageItemBuilder extends QueueItemBaseBuilder<RenderItemImage> {
    constructor(url: string) {
        super(new RenderItemImage(url))
    }

    position(x: number, y: number) {
        return this.chain(() => this.shape.absolute = { x, y })
    }

    size(value: number) {
        return this.chain(() => this.shape.size = value)
    }

    box(x: number, y: number, width: number, height: number) {
        return this.chain(() => this.shape.box = { x, y, width, height })
    }

    crossOrigin(mode: ImageCrossOrigin | undefined) {
        return this.chain(() => this.shape.crossOrigin = mode)
    }
}