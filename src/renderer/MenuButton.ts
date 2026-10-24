import { contains } from '@/helpers/Geometry'
import Frame from '@/types/Frame'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import HoverProgress from '@/types/HoverProgress'
import { AnimationTiming } from '@/static/constants/Index'
import { Icon } from '@/static/Enums'

const WIDTH = 28

const HEIGHT = 24

const PADDING = 8

const FONT_SIZE = 20

export default class MenuButton extends Overlay {
    static readonly rowHeight = HEIGHT + PADDING * 2

    onClick: (() => void) | undefined

    bounds: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private hover = new HoverProgress()

    private isDirty: boolean = true

    resize(width: number, height: number, top: number) {
        this.size = { width, height }
        this.bounds = new DOMRect(width - PADDING - WIDTH, Math.max((top - HEIGHT) / 2, PADDING), WIDTH, HEIGHT)
        this.isDirty = true
    }

    update({ queue, mouse, now }: Frame): boolean {
        if (!this.bounds || !this.size || this.size.width <= 0 || this.size.height <= 0) {
            this.clear(queue)

            return false
        }

        const bounds = this.bounds

        const isHoverChanged = this.hover.step(contains(bounds, mouse), now, AnimationTiming.button)

        if (!this.isDirty && !isHoverChanged)
            return this.hover.isAnimating

        const units = Units.fromSize(this.size.width, this.size.height)

        this.show(queue, QueueItemsBuilder.build((items: QueueItemsBuilder) => {
            this.buttonRect(items, units, bounds, 4, this.hover.value, () => this.onClick?.())
            this.buttonText(items, units, bounds, Icon.ThreeDots, FONT_SIZE)
        }))

        this.isDirty = false

        return this.hover.isAnimating
    }

    clear(queue: Queue) {
        this.isDirty = true

        this.remove(queue)
    }
}