import Queue from '@/render/Queue'
import Overlay from '@/renderer/Overlay'
import Frame from '@/renderer/Frame'
import Units from '@/helpers/Units'
import Rectangle from '@/helpers/Rectangle'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import { Bounds } from '@/types/interfaces/RenderItemBase'
import { withAlpha } from '@/helpers/Color'
import { Layer } from '@/static/constants/Index'

const RADIUS = 4

const FILL_ALPHA = .12

export default class FocusRing extends Overlay {
    private shown: RectangleDimensions | null = null

    constructor(private readonly getBounds: () => Bounds | null) {
        super()
    }

    update({ queue, screen, theme }: Frame) {
        const bounds = this.getBounds()

        if (!bounds || screen.width <= 0 || screen.height <= 0) {
            this.clear(queue)

            return false
        }

        const area = {
            x: bounds.left,
            y: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top
        }

        if (this.shown && Rectangle.same(this.shown, area))
            return false

        const units = Units.fromSize(screen.width, screen.height)

        this.shown = area

        this.show(queue, QueueItemsBuilder.build((items: QueueItemsBuilder) => {
            items.rect()
                 .box(units, area)
                 .round(units.x(RADIUS))
                 .fill()
                 .color(withAlpha(theme.text, FILL_ALPHA))
                 .stroke(theme.text)
                 .layer(Layer.Legend + 3)
                 .fixed()
        }))

        return false
    }

    clear(queue: Queue) {
        this.shown = null

        this.remove(queue)
    }
}