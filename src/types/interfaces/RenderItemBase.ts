import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'

export type Bounds = {
    left: number
    top: number
    right: number
    bottom: number
}

export default abstract class RenderItemBase {
    abstract adjust(window: CanvasWindow, morph?: number): void

    abstract render(ctx: CanvasRenderingContext2D, item: RenderItem): void

    // todo: add animation builder
    animate(_item: RenderItem, _isBackward: boolean, _now: DOMHighResTimeStamp): void {
    }

    isMouseOver(_point: Point): boolean {
        return false
    }

    get defaultColor(): string | undefined {
        return undefined
    }

    getBounds(): Bounds | null {
        return null
    }

    morphFrom(_previous: RenderItemBase, _morph: number): boolean {
        return false
    }

    appear(_mapY?: (y: number) => number): boolean {
        return false
    }

    disappear(_morph: number, _mapY?: (y: number) => number): boolean {
        return false
    }

    enterFromAxis(_y: number): boolean {
        return false
    }

    leaveToAxis(_y: number, _morph: number): boolean {
        return false
    }
}