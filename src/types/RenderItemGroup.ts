import RenderItem from './RenderItem'
import { RenderGroupDirection } from '../static/Enums'
import Margin from './Margin'
import RenderItemBase from './interfaces/RenderItemBase'
import CanvasWindow from './CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import Point from './Point'

export default class RenderItemGroup
    implements RenderItemBase {
    adjust(window: CanvasWindow): void {
        return
    }

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow): void {
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
                    item.rect.x
                        = margin.left
                          + this.gap * index
                          + itemSize * index
                          + itemSize / 2
                    item.rect.y
                        = COORDS_MAX_Y / 2
                    item.rect.width
                        = itemSize
                    item.rect.height
                        = COORDS_MAX_Y - margin.top - margin.bottom

                    break

                case RenderGroupDirection.Column:
                case RenderGroupDirection.ColumnReversed:
                    item.rect.x
                        = COORDS_MAX_X / 2
                    item.rect.y
                        = margin.top
                          + this.gap * index
                          + itemSize * index
                          + itemSize / 2
                    item.rect.width
                        = COORDS_MAX_X - margin.left - margin.right
                    item.rect.height
                        = itemSize

                    break
            }

            item.render(ctx, window)

            index++
        }

        if (isReverse) {
            this.items.reverse()
        }
    }

    animate(point: Point, _item: RenderItem) {
        for (const item of this.items) {
            item.animate(point)
        }
    }

    gap: number = 0

    direction: RenderGroupDirection = RenderGroupDirection.Row

    items: RenderItem[] = []

    margin: Margin | null
}