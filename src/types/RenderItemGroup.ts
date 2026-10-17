import RenderItem from './RenderItem'
import { RenderGroupDirection } from '../static/Enums'
import Margin from './Margin'
import RenderItemBase from './interfaces/RenderItemBase'
import CanvasWindow from './CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import Point from './Point'

export default class RenderItemGroup
    implements RenderItemBase {
    animate(item: RenderItem, isBackward: boolean, point: Point): void {
        for (const item of this.items) {
            item.animate(point)
        }
    }

    contextMenu(point: Point) {
        for (const item of this.items) {
            item.contextMenu(point)
        }
    }

    isMouseOver(point: Point): boolean {
        return true
    }

    adjust(window: CanvasWindow): void {
        this.window = window
    }

    render(ctx: CanvasRenderingContext2D): void {
        const margin = this.margin ?? new Margin()
        const itemsCount = this.items.length

        const isRow = this.direction.isAnyEquals(
            RenderGroupDirection.Row,
            RenderGroupDirection.RowReversed
        )

        const itemSize
            = isRow
              ? Math.round((COORDS_MAX_X - this.gap * (itemsCount - 1) - margin.left - margin.right) / itemsCount)
              : Math.round((COORDS_MAX_Y - this.gap * (itemsCount - 1) - margin.top - margin.bottom) / itemsCount)

        const isReverse = this.direction.isAnyEquals(
            RenderGroupDirection.RowReversed,
            RenderGroupDirection.ColumnReversed
        )

        if (isReverse) {
            this.items.reverse()
        }

        let index = 0

        for (const item of this.items) {
            switch (this.direction) {
                case RenderGroupDirection.Row:
                case RenderGroupDirection.RowReversed:
                    item.rect.absolute.x
                        = margin.left
                          + this.gap * index
                          + itemSize * index
                          + itemSize / 2
                    item.rect.absolute.y
                        = COORDS_MAX_Y / 2
                    item.rect.absolute.width
                        = itemSize
                    item.rect.absolute.height
                        = COORDS_MAX_Y - margin.top - margin.bottom

                    break

                case RenderGroupDirection.Column:
                case RenderGroupDirection.ColumnReversed:
                    item.rect.absolute.x
                        = COORDS_MAX_X / 2
                    item.rect.absolute.y
                        = margin.top
                          + this.gap * index
                          + itemSize * index
                          + itemSize / 2
                    item.rect.absolute.width
                        = COORDS_MAX_X - margin.left - margin.right
                    item.rect.absolute.height
                        = itemSize

                    break
            }

            item.render(ctx, this.window)

            index++
        }

        if (isReverse) {
            this.items.reverse()
        }
    }

    gap: number = 0

    direction: RenderGroupDirection = RenderGroupDirection.Row

    items: RenderItem[] = []

    margin: Margin | null

    private window: CanvasWindow
}