import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemCells, { CellLookup } from '@/types/RenderItemCells'
import CellsRenderData from '@/types/CellsRenderData'
import ItemData from '@/types/ItemData'

export default class QueueCellsItemBuilder extends QueueItemBaseBuilder<RenderItemCells> {
    constructor() {
        super(new RenderItemCells())
    }

    box(x: number, y: number, width: number, height: number) {
        this.shape.box = { x, y, width, height }

        return this
    }

    cells(cells: CellsRenderData) {
        this.shape.cells = cells

        return this
    }

    lookup(lookup: CellLookup<string>) {
        this.shape.lookup = lookup

        return this
    }

    dataLookup(lookup: CellLookup<ItemData>) {
        this.shape.dataLookup = lookup

        return this
    }
}