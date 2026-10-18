import { contains } from '@/Helper'
import Point from '@/types/Point'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import HoverProgress from '@/types/HoverProgress'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, Icon, TextAlignment, VerticalAlignment } from '@/static/Enums'

export default class MenuButton extends Overlay {
    private static readonly width = 28

    private static readonly height = 24

    private static readonly padding = 8

    private static readonly fontSize = 20

    onClick: (() => void) | undefined

    bounds: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private hover = new HoverProgress()

    private isDirty: boolean = true

    resize(width: number, height: number, top: number) {
        const { width: buttonWidth, height: buttonHeight, padding } = MenuButton

        this.size = { width, height }
        this.bounds = new DOMRect(width - padding - buttonWidth, Math.max((top - buttonHeight) / 2, padding), buttonWidth, buttonHeight)
        this.isDirty = true
    }

    build(queue: Queue, mouse: Point | null, now: DOMHighResTimeStamp): boolean {
        if (!this.bounds || !this.size || this.size.width <= 0 || this.size.height <= 0) {
            this.clear(queue)

            return false
        }

        const { x, y, width, height } = this.bounds

        const isHoverChanged = this.hover.step(contains(this.bounds, mouse), now, AnimationTiming.button)

        if (!this.isDirty && !isHoverChanged)
            return this.hover.isAnimating

        const units = Units.fromSize(this.size.width, this.size.height)

        this.show(queue, QueueItemsBuilder.build((items: QueueItemsBuilder) => {
            items.rect()
                 .position(units.x(x), units.y(y))
                 .size(units.x(width), units.y(height))
                 .round(units.x(4))
                 .fill()
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .color(Theme.hoverBackground(this.hover.value))
                 .layer(Layer.Legend + 1)
                 .fixed()
                 .onClick(() => this.onClick?.())

            items.text(Icon.ThreeDots)
                 .position(units.x(x + width / 2), units.y(y + height / 2))
                 .size(MenuButton.fontSize)
                 .align(TextAlignment.Center)
                 .color(Theme.text)
                 .layer(Layer.Legend + 2)
                 .fixed()
        }))

        this.isDirty = false

        return this.hover.isAnimating
    }

    clear(queue: Queue) {
        this.isDirty = true

        this.remove(queue)
    }
}