import CanvasWindow from '../CanvasWindow'
import Point from '../Point'
import RenderItem from '../RenderItem'

export default interface RenderItemBase {
    adjust(window: CanvasWindow, morph?: number): void

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow, item?: RenderItem): void

    // todo: add animation builder
    animate(item: RenderItem, isBackward: boolean, point: Point): void

    // todo: add tooltip builder
    tooltip(item: RenderItem, point: Point): boolean

    contextMenu(item: RenderItem, point: Point): boolean

    isMouseOver(point: Point): boolean
}