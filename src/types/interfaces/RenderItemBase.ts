import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import { ThemePalette } from '@/Theme'
import ItemData from '@/types/ItemData'

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

    animateHover(_point: Point | null, _now: DOMHighResTimeStamp, _isInstant: boolean = false): boolean {
        return false
    }

    canBeCached(): boolean {
        return true
    }

    getDependencies(): RenderItemBase[] {
        return []
    }

    isMouseOver(_point: Point): boolean {
        return false
    }

    tooltipAt(_point: Point): string | null {
        return null
    }

    dataAt(_point: Point): ItemData | null {
        return null
    }

    tooltipDistanceAt(_point: Point): number | null {
        return null
    }

    defaultColor(_theme: ThemePalette): string | undefined {
        return undefined
    }

    getBounds(): Bounds | null {
        return null
    }

    getFocusBounds(): Bounds | null {
        return this.getBounds()
    }

    getFocusPoint(): Point | null {
        const bounds = this.getBounds()

        return bounds && { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 }
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