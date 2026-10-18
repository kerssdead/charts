import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import ItemData from '@/types/ItemData'
import HoverProgress from '@/types/HoverProgress'
import CustomTooltip from '@/renderer/CustomTooltip'
import Theme from '@/Theme'
import { Layer, Tooltip } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { placeNear, stringWidth } from '@/Helper'

export default class TooltipOverlay extends Overlay {
    private readonly canvas: HTMLCanvasElement

    private state: { point: Point, template: string } | null = null

    private fade = new HoverProgress()

    private built: { point: Point, template: string, window: Pick<CanvasWindow, 'x' | 'y' | 'width' | 'height'> } | null = null

    private scan: {
        point: Point
        version: number
        window: Pick<CanvasWindow, 'x' | 'y' | 'width' | 'height'>
        template: string | null
        data: ItemData | null
    } | null = null

    constructor(canvas: HTMLCanvasElement) {
        super()

        this.canvas = canvas
    }

    update(queue: Queue,
           window: CanvasWindow,
           point: Point | null,
           isContextMenuOpen: boolean,
           custom: CustomTooltip | null,
           now: DOMHighResTimeStamp): boolean {
        const { template, data } = point && !isContextMenuOpen
                                   ? this.getTarget(queue, window, point)
                                   : { template: null, data: null }

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

        this.fade.step(isVisible, now, Tooltip.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha == 0) {
            this.state = null
        }

        if (!this.state || alpha == 0) {
            this.remove(queue)

            return false
        }

        const state = this.state

        if (!this.isBuilt(state.point, state.template, window))
            this.add(queue, window, state.point, state.template)

        for (const item of this.items) {
            item.animation.alpha = alpha
        }

        return this.fade.isAnimating
    }

    clear(queue: Queue) {
        this.remove(queue)

        this.state = null
        this.fade = new HoverProgress()
    }

    private getTarget(queue: Queue, window: CanvasWindow, point: Point) {
        const scan = this.scan

        if (scan != null && !queue.isAnimating && scan.version == queue.version
            && scan.point.x == point.x && scan.point.y == point.y
            && scan.window.x == window.x && scan.window.y == window.y
            && scan.window.width == window.width && scan.window.height == window.height)
            return scan

        let template: string | null = null
        let data: ItemData | null = null

        for (const item of queue.items) {
            item.tooltip(point)

            if (template == null && item.showTooltip) {
                template = item.tooltipTemplate
                data = item.data
            }
        }

        this.scan = {
            point,
            version: queue.version,
            window: { x: window.x, y: window.y, width: window.width, height: window.height },
            template,
            data
        }

        return this.scan
    }

    private isBuilt(point: Point, template: string, window: CanvasWindow) {
        const built = this.built

        return built != null
               && built.point.x == point.x && built.point.y == point.y && built.template == template
               && built.window.x == window.x && built.window.y == window.y
               && built.window.width == window.width && built.window.height == window.height
    }

    protected remove(queue: Queue) {
        super.remove(queue)

        this.built = null
    }

    private add(queue: Queue, window: CanvasWindow, point: Point, template: string) {
        this.show(queue, QueueItemsBuilder.build([
            (builder: QueueItemsBuilder) => this.build(builder, window, point, template)
        ]))

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

        const units = Units.fromWindow(window)

        items.rect()
             .position(units.positionX(left), units.positionY(top))
             .size(units.x(width), units.y(height))
             .fill()
             .round(Array(4).fill(units.x(radius)))
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.background)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.Tooltip)

        rows.forEach((row, index) => {
            items.text(row)
                 .position(units.positionX(left + padding), units.positionY(top + padding + (index + .5) * rowHeight))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.Tooltip)
        })
    }
}