import RenderItemCells from '@/types/RenderItemCells'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import CellsRenderData from '@/types/CellsRenderData'
import { packColor } from '@/helpers/PackedColor'

export const WINDOW = new CanvasWindow(1000, 1000)

export const RED = packColor('#ff0000')

export const BLUE = packColor('#0000ff')

export const cellsData = (colors: number[], extra: Partial<CellsRenderData> = {}): CellsRenderData => {
    return {
        columns: colors.length,
        rows: 1,
        colors: Uint32Array.from(colors),
        delays: new Float32Array(colors.length),
        labels: [],
        labelSize: 12,
        ...extra
    }
}

export const cellsItem = (cells: CellsRenderData | null = cellsData([RED, BLUE])) => {
    const shape = new RenderItemCells()

    shape.box = { x: 1000, y: 2000, width: 500, height: 250 }
    shape.cells = cells

    return shape
}

export const renderItem = (shape: RenderItemCells, init = 1) => {
    const item = new RenderItem(shape)

    item.animation.init = init

    return item
}

export const context = () => {
    const ctx = {
        imageSmoothingEnabled: true,
        smoothingWhileDrawing: [] as boolean[],
        drawImage: jest.fn(() => ctx.smoothingWhileDrawing.push(ctx.imageSmoothingEnabled))
    }

    return ctx
}

export const render = (shape: RenderItemCells, init = 1, ctx = context()) => {
    shape.render(ctx as unknown as CanvasRenderingContext2D, renderItem(shape, init))

    return ctx
}