import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import FadingOverlay from '@/renderer/FadingOverlay'
import Units from '@/helpers/Units'
import CanvasWindow from '@/types/CanvasWindow'
import Frame from '@/types/Frame'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import ItemData from '@/types/ItemData'
import ChartSettings from '@/types/ChartSettings'
import RenderItem from '@/types/RenderItem'
import CustomTooltip from '@/renderer/CustomTooltip'
import Theme from '@/Theme'
import { Layer, Tooltip } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { copyRect, placeNear, sameRect, samePoint } from '@/helpers/Geometry'
import { maxOf } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'

type TooltipState = { point: Point, template: string }

type TooltipBuilt = TooltipState & { window: RectangleDimensions }

type TooltipTarget = {
    template: string | null
    html: string | null
}

type TooltipScan = TooltipTarget & {
    point: Point
    version: number
    window: RectangleDimensions
}

const NO_TARGET: TooltipTarget = { template: null, html: null }

export default class TooltipOverlay extends FadingOverlay<TooltipState, TooltipBuilt> {
    isEnabled: boolean = false

    template: ((data: ItemData) => string) | null = null

    readonly custom: CustomTooltip

    private readonly canvas: HTMLCanvasElement

    private scan: TooltipScan | null = null

    constructor(canvas: HTMLCanvasElement) {
        super()

        this.canvas = canvas
        this.custom = new CustomTooltip(canvas)
    }

    apply(settings: ChartSettings) {
        this.custom.hide()

        this.isEnabled = settings.enableTooltip
        this.template = settings.enableTooltip && settings.templateId
                        ? CustomTooltip.fromTemplate(settings.templateId)
                        : null
    }

    reset(queue: Queue) {
        this.custom.hide()
        this.template = null

        this.clear(queue)
    }

    update({ queue, window, mouse, context, now }: Frame): boolean {
        const point = this.isEnabled ? mouse : null
        const target = point && !context ? this.getTarget(queue, window, point) : NO_TARGET
        const isVisible = this.updateState(point, target)

        this.fade.step(isVisible, now, Tooltip.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha === 0) {
            this.state = null
        }

        if (!this.state || alpha === 0) {
            this.remove(queue)

            return false
        }

        const state = this.state

        if (!this.isBuilt(state.point, state.template, window)) {
            this.show(queue, QueueItemsBuilder.build((builder: QueueItemsBuilder) => {
                this.build(builder, window, state.point, state.template)
            }))

            this.built = { point: state.point, template: state.template, window: copyRect(window) }
        }

        this.setAlpha(alpha)

        return this.fade.isAnimating
    }

    private updateState(point: Point | null, { template, html }: TooltipTarget) {
        if (point && html)
            this.custom.show(html, point)
        else
            this.custom.hide()

        const isVisible = !html && point != null && template != null

        if (isVisible)
            this.state = { point, template }
        else if (this.state && point)
            this.state.point = point

        return isVisible
    }

    private getTarget(queue: Queue, window: CanvasWindow, point: Point): TooltipTarget {
        const scan = this.scan

        if (scan != null && TooltipOverlay.isScanCurrent(scan, queue, window, point))
            return scan

        const target = queue.findTop(item => item.hasTooltipAt(point))

        this.scan = {
            point,
            version: queue.version,
            window: copyRect(window),
            template: target?.tooltipAt(point) ?? null,
            html: target ? this.getHtml(target) : null
        }

        return this.scan
    }

    private static isScanCurrent(scan: TooltipScan, queue: Queue, window: CanvasWindow, point: Point) {
        return !queue.isAnimating
               && scan.version === queue.version
               && samePoint(scan.point, point)
               && sameRect(scan.window, window)
    }

    private getHtml(target: RenderItem) {
        const templateHtml = this.template && target.data ? this.template(target.data) : undefined

        return templateHtml ?? target.tooltipHtml ?? null
    }

    private isBuilt(point: Point, template: string, window: CanvasWindow) {
        const built = this.built

        return built != null
               && samePoint(built.point, point) && built.template === template
               && sameRect(built.window, window)
    }

    private build(items: QueueItemsBuilder, window: CanvasWindow, point: Point, template: string) {
        const { clientWidth: canvasWidth, clientHeight: canvasHeight } = this.canvas

        const rows = template.split('\n')

        const width = maxOf(rows, row => stringWidth(row, Tooltip.fontSize)) + Tooltip.padding * 2
        const height = rows.length * Tooltip.rowHeight + Tooltip.padding * 2

        const { x: left, y: top } = placeNear(
            point,
            { width, height },
            Tooltip.offset,
            { x: 0, y: 0, width: canvasWidth, height: canvasHeight }
        )

        const units = Units.fromWindow(window)

        items.rect()
             .box(units, { x: left, y: top, width, height })
             .fill()
             .round(units.x(Tooltip.radius))
             .color(Theme.background)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.Tooltip)

        rows.forEach((row, index) => {
            items.text(row)
                 .position(
                     units.positionX(left + Tooltip.padding),
                     units.positionY(top + Tooltip.padding + (index + .5) * Tooltip.rowHeight)
                 )
                 .size(Tooltip.fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.Tooltip)
        })
    }
}