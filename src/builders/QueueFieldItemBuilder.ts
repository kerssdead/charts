import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemField, { FieldLookup } from '@/types/RenderItemField'
import FieldRenderData from '@/types/FieldRenderData'

export default class QueueFieldItemBuilder extends QueueItemBaseBuilder<RenderItemField> {
    constructor() {
        super(new RenderItemField())
    }

    box(x: number, y: number, width: number, height: number) {
        this.shape.box = { x, y, width, height }

        return this
    }

    field(field: FieldRenderData) {
        this.shape.field = field

        return this
    }

    lookup(lookup: FieldLookup) {
        this.shape.lookup = lookup

        return this
    }
}