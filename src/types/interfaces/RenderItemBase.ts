import CanvasWindow from '../CanvasWindow'
import Point from '../Point'
import RenderItem from '../RenderItem'

export default interface RenderItemBase {
    adjust(window: CanvasWindow) : void

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow) : void

    // todo: add animation builder
    animate(item: RenderItem, isBackward: boolean, point: Point) : void

    // todo: add tooltip builder
    tooltip(item: RenderItem, point: Point) : boolean

    isMouseOver(point: Point) : boolean
}