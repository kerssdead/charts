import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import ItemData from '@/types/ItemData'
import HoverProgress from '@/types/HoverProgress'
import CustomTooltip from '@/renderer/CustomTooltip'
import Theme from '@/Theme'
import { Layer, Tooltip } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { placeNear, stringWidth } from '@/Helper'

export default class TooltipOverlay {
    private readonly canvas: HTMLCanvasElement

    private state: { point: Point, template: string } | null = null

    private fade = new HoverProgress()

    private items: Set<RenderItem> = new Set()

    private built: { point: Point, template: string, window: Pick<CanvasWindow, 'x' | 'y' | 'width' | 'height'> } | null = null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    update(queue: Queue, window: CanvasWindow, point: Point | null, isContextMenuOpen: boolean, custom: CustomTooltip | null) {
        let template: string | null = null
        let data: ItemData | null = null

        if (point && !isContextMenuOpen) {
            for (const item of queue.items) {
                item.tooltip(point)

                if (template == null && item.showTooltip) {
                    template = item.tooltipTemplate
                    data = item.data
                }
            }
        }

        if (custom && point && data)
            custom.show(data, point)
        else
            custom?.hide()

        const isVisible = !(custom && data) && point != null && template != null

        if (isVisible) {
            this.state = { point: point as Point, template: template as string }
        } else if (this.state && point) {
            this.state.point = point
        }

        this.fade.step(isVisible, performance.now(), Tooltip.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha == 0) {
            this.state = null
        }

        if (!this.state || alpha == 0) {
            this.remove(queue)

            return
        }

        const state = this.state

        if (!this.isBuilt(state.point, state.template, window)) {
            this.remove(queue)
            this.add(queue, window, state.point, state.template)
        }

        for (const item of this.items) {
            item.animation.alpha = alpha
        }
    }

    clear(queue: Queue) {
        this.remove(queue)

        this.state = null
        this.fade = new HoverProgress()
    }

    private isBuilt(point: Point, template: string, window: CanvasWindow) {
        const built = this.built

        return built != null
               && built.point.x == point.x && built.point.y == point.y && built.template == template
               && built.window.x == window.x && built.window.y == window.y
               && built.window.width == window.width && built.window.height == window.height
    }

    private remove(queue: Queue) {
        queue.remove(this.items)

        this.items.clear()
        this.built = null
    }

    private add(queue: Queue, window: CanvasWindow, point: Point, template: string) {
        const items = QueueItemsBuilder.build([
            (builder: QueueItemsBuilder) => this.build(builder, window, point, template)
        ])

        queue.add(items)

        this.items = new Set(items)
        this.built = { point, template, window: { x: window.x, y: window.y, width: window.width, height: window.height } }
    }

    private build(items: QueueItemsBuilder, window: CanvasWindow, point: Point, template: string) {
        const { offset, padding, rowHeight, fontSize, radius } = Tooltip
        const { clientWidth: canvasWidth, clientHeight: canvasHeight } = this.canvas

        const rows = template.split('\n')

        const width = Math.max(...rows.map(row => stringWidth(row, fontSize))) + padding * 2
        const height = rows.length * rowHeight + padding * 2

        const { x: left, y: top } = placeNear(point, width, height, offset,
            { x: 0, y: 0, width: canvasWidth, height: canvasHeight })

        const toX = (x: number) => RenderItem.reAdjustX(window, x)
        const toY = (y: number) => RenderItem.reAdjustY(window, y)

        items.rect()
             .position(toX(left), toY(top))
             .size(RenderItem.reAdjustWidth(window, width), RenderItem.reAdjustHeight(window, height))
             .fill()
             .round(Array(4).fill(RenderItem.reAdjustWidth(window, radius)))
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.background)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.Tooltip)

        rows.forEach((row, index) => {
            items.text(row)
                 .position(toX(left + padding + fontSize / 2), toY(top + padding + (index + .5) * rowHeight))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.Tooltip)
        })
    }
}