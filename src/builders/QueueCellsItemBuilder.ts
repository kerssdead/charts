import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemCells, { CellLookup } from '@/types/RenderItemCells'
import CellsRenderData from '@/types/CellsRenderData'
import ItemData from '@/types/ItemData'

export default class QueueCellsItemBuilder extends QueueItemBaseBuilder<RenderItemCells> {
    constructor() {
        super(new RenderItemCells())
    }

    box(x: number, y: number, width: number, height: number) {
        return this.chain(() => this.shape.box = { x, y, width, height })
    }

    cells(cells: CellsRenderData) {
        return this.chain(() => this.shape.cells = cells)
    }

    lookup(lookup: CellLookup<string>) {
        return this.chain(() => this.shape.lookup = lookup)
    }

    dataLookup(lookup: CellLookup<ItemData>) {
        return this.chain(() => this.shape.dataLookup = lookup)
    }
}