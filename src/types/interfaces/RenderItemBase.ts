import CanvasWindow from '../CanvasWindow'

export default interface RenderItemBase {
    adjust(window: CanvasWindow) : void

    render(ctx: CanvasRenderingContext2D, window?: CanvasWindow) : void
}