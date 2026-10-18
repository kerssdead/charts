import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import FadingOverlay from '@/renderer/FadingOverlay'
import Units from '@/helpers/Units'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import ItemData from '@/types/ItemData'
import CustomTooltip from '@/renderer/CustomTooltip'
import Theme from '@/Theme'
import { Layer, Tooltip } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { copyRect, maxOf, placeNear, sameRect, samePoint, stringWidth } from '@/Helper'

type TooltipState = { point: Point, template: string }

type TooltipBuilt = TooltipState & { window: RectangleDimensions }

export default class TooltipOverlay extends FadingOverlay<TooltipState, TooltipBuilt> {
    private readonly canvas: HTMLCanvasElement

    private scan: {
        point: Point
        version: number
        window: RectangleDimensions
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
            this.state = { point, template }
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

        this.setAlpha(alpha)

        return this.fade.isAnimating
    }

    private getTarget(queue: Queue, window: CanvasWindow, point: Point) {
        const scan = this.scan

        if (scan != null && !queue.isAnimating && scan.version == queue.version
            && samePoint(scan.point, point) && sameRect(scan.window, window))
            return scan

        const target = queue.items.find(item => item.hasTooltipAt(point))

        this.scan = {
            point,
            version: queue.version,
            window: copyRect(window),
            template: target?.tooltipTemplate ?? null,
            data: target?.data ?? null
        }

        return this.scan
    }

    private isBuilt(point: Point, template: string, window: CanvasWindow) {
        const built = this.built

        return built != null
               && samePoint(built.point, point) && built.template == template
               && sameRect(built.window, window)
    }

    private add(queue: Queue, window: CanvasWindow, point: Point, template: string) {
        this.show(queue, QueueItemsBuilder.build((builder: QueueItemsBuilder) => this.build(builder, window, point, template)))

        this.built = { point, template, window: copyRect(window) }
    }

    private build(items: QueueItemsBuilder, window: CanvasWindow, point: Point, template: string) {
        const { offset, padding, rowHeight, fontSize, radius } = Tooltip
        const { clientWidth: canvasWidth, clientHeight: canvasHeight } = this.canvas

        const rows = template.split('\n')

        const width = maxOf(rows, row => stringWidth(row, fontSize)) + padding * 2
        const height = rows.length * rowHeight + padding * 2

        const { x: left, y: top } = placeNear(point, width, height, offset,
            { x: 0, y: 0, width: canvasWidth, height: canvasHeight })

        const units = Units.fromWindow(window)

        items.rect()
             .position(units.positionX(left), units.positionY(top))
             .size(units.x(width), units.y(height))
             .fill()
             .round(units.x(radius))
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