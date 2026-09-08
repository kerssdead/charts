import CanvasWindow from '../CanvasWindow'
import Point from '../Point'
import RenderItem from '../RenderItem'

export default interface RenderItemBase {
    adjust(window: CanvasWindow) : void

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow) : void

    animate(item: RenderItem, isBackward: boolean, point: Point) : void

    isMouseOver(point: Point) : boolean
}