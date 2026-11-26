import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemField, { FieldLookup } from '@/types/RenderItemField'
import FieldRenderData from '@/types/FieldRenderData'

export default class QueueFieldItemBuilder extends QueueItemBaseBuilder<RenderItemField> {
    constructor() {
        super(new RenderItemField())
    }

    box(x: number, y: number, width: number, height: number) {
        return this.chain(() => this.shape.box = { x, y, width, height })
    }

    field(field: FieldRenderData) {
        return this.chain(() => this.shape.field = field)
    }

    lookup(lookup: FieldLookup) {
        return this.chain(() => this.shape.lookup = lookup)
    }
}