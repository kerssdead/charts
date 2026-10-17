import * as Helper from 'Helper'
import Point from 'types/Point'
import RenderItem from 'types/RenderItem'
import Theme from 'Theme'
import Queue from 'render/Queue'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import HoverProgress from 'types/HoverProgress'
import * as Constants from 'static/constants/Index'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from 'static/constants/Index'
import { HorizontalAlignment, Icon, TextAlignment, VerticalAlignment } from 'static/Enums'

export default class MenuButton {
    private static readonly width = 28

    private static readonly height = 24

    private static readonly padding = 8

    private static readonly fontSize = 20

    onClick: (() => void) | undefined

    bounds: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private items: Set<RenderItem> = new Set()

    private hover = new HoverProgress()

    private isDirty: boolean = true

    resize(width: number, height: number, top: number) {
        const { width: buttonWidth, height: buttonHeight, padding } = MenuButton

        this.size = { width, height }
        this.bounds = new DOMRect(width - padding - buttonWidth, Math.max((top - buttonHeight) / 2, padding), buttonWidth, buttonHeight)
        this.isDirty = true
    }

    build(queue: Queue, mouse: Point | null) {
        if (!this.bounds || !this.size || this.size.width <= 0 || this.size.height <= 0) {
            this.clear(queue)

            return
        }

        const { x, y, width, height } = this.bounds

        const isOver = !!mouse && x <= mouse.x && mouse.x <= x + width && y <= mouse.y && mouse.y <= y + height
        const isHoverChanged = this.hover.step(isOver, performance.now(), Constants.Animations.button)

        if (!this.isDirty && !isHoverChanged)
            return

        this.clear(queue)

        const added = queue.add((items: QueueItemsBuilder) => {
            items.rect()
                 .position(this.x(x), this.y(y))
                 .size(this.x(width), this.y(height))
                 .round([4, 4, 4, 4])
                 .fill()
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .color(Helper.adjustColor(Theme.canvasBackground, Math.round(-25 * this.hover.value)))
                 .layer(Layer.Legend + 1)
                 .fixed()
                 .onClick(() => this.onClick?.())

            items.text(Icon.ThreeDots)
                 .position(this.x(x + width / 2 + MenuButton.fontSize / 2), this.y(y + height / 2))
                 .size(MenuButton.fontSize)
                 .align(TextAlignment.Center)
                 .color(Theme.text)
                 .layer(Layer.Legend + 2)
                 .fixed()
        })

        this.items = new Set(added)
        this.isDirty = false
    }

    clear(queue: Queue) {
        this.isDirty = true

        if (this.items.size == 0)
            return

        queue.queue = queue.queue.filter(item => !this.items.has(item))

        this.items.clear()
    }

    private x(value: number) {
        return value * COORDS_MAX_X / this.size!.width
    }

    private y(value: number) {
        return value * COORDS_MAX_Y / this.size!.height
    }
}