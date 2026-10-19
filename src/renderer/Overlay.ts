import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import Frame from '@/types/Frame'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'

export default abstract class Overlay {
    protected items: Set<RenderItem> = new Set()

    abstract update(frame: Frame): boolean

    protected show(queue: Queue, items: RenderItem[]) {
        queue.remove(this.items)
        queue.add(items)

        this.items = new Set(items)
    }

    protected remove(queue: Queue) {
        queue.remove(this.items)

        this.items.clear()
    }

    protected buttonRect(items: QueueItemsBuilder, units: Units, rect: RectangleDimensions, radius: number, hover: number, onClick: () => void) {
        return items.rect()
                    .box(units, rect)
                    .round(units.x(radius))
                    .fill()
                    .color(Theme.hoverBackground(hover))
                    .layer(Layer.Legend + 1)
                    .fixed()
                    .onClick(onClick)
    }

    protected buttonText(items: QueueItemsBuilder, units: Units, rect: RectangleDimensions, text: string, size: number) {
        items.text(text)
             .position(units.x(rect.x + rect.width / 2), units.y(rect.y + rect.height / 2))
             .size(size)
             .align(TextAlignment.Center)
             .color(Theme.text)
             .layer(Layer.Legend + 2)
             .fixed()
    }
}