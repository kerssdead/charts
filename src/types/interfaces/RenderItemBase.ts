import CanvasWindow from '../CanvasWindow'
import Point from '../Point'

export default interface RenderItemBase {
    adjust(window: CanvasWindow) : void

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow) : void

    animate(point: Point) : void
}