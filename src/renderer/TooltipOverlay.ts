import Queue from '@/render/Queue'
import Overlay from '@/renderer/Overlay'
import CanvasWindow from '@/types/CanvasWindow'
import Frame from '@/renderer/Frame'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import ItemData from '@/types/ItemData'
import ChartSettings from '@/types/ChartSettings'
import RenderItem from '@/types/RenderItem'
import HoverProgress from '@/types/HoverProgress'
import CustomTooltip from '@/renderer/CustomTooltip'
import { ThemePalette } from '@/Theme'
import { Tooltip } from '@/static/constants/Index'
import { copyRect, sameRect, samePoint } from '@/helpers/Geometry'

type TooltipTarget = {
    template: string | null
    html: string | null
}

type TooltipScan = TooltipTarget & {
    point: Point
    version: number
    window: RectangleDimensions
}

type TextUpdate = Pick<Frame, 'now' | 'theme' | 'isInstant'>

const NO_TARGET: TooltipTarget = { template: null, html: null }

export default class TooltipOverlay extends Overlay {
    isEnabled: boolean = false

    template: ((data: ItemData) => string) | null = null

    readonly custom: CustomTooltip

    private scan: TooltipScan | null = null

    private state: { point: Point, html: string } | null = null

    private fade = new HoverProgress()

    constructor(canvas: HTMLCanvasElement) {
        super()

        this.custom = new CustomTooltip(canvas)
    }

    apply(settings: ChartSettings) {
        this.custom.hide()
        this.scan = null
        this.state = null
        this.fade = new HoverProgress()
        this.isEnabled = settings.enableTooltip
        this.template = settings.enableTooltip && settings.templateId
                        ? CustomTooltip.fromTemplate(settings.templateId)
                        : null
    }

    reset(queue: Queue) {
        this.template = null
        this.clear(queue)
    }

    clear(_queue: Queue) {
        this.custom.hide()
        this.scan = null
        this.state = null
        this.fade = new HoverProgress()
    }

    update({ queue, window, mouse, context, now, theme, isInstant }: Frame): boolean {
        if (context || !this.isEnabled) {
            this.clear(queue)

            return false
        }

        const target = mouse ? this.getTarget(queue, window, mouse) : NO_TARGET

        if (mouse && target.html) {
            this.state = null
            this.fade = new HoverProgress()
            this.custom.show(target.html, mouse)
            this.custom.setOpacity(1)

            return false
        }

        return this.updateText(mouse, target.template, { now, theme, isInstant })
    }

    private updateText(mouse: Point | null, template: string | null, { now, theme, isInstant }: TextUpdate) {
        const isVisible = mouse != null && template != null

        if (isVisible)
            this.state = { point: mouse, html: CustomTooltip.fromText(template, theme) }

        this.fade.step(isVisible, now, Tooltip.fadeDuration, isInstant)

        if (!this.state || !isVisible && this.fade.isIdle) {
            this.custom.hide()
            this.state = null

            return false
        }

        this.custom.show(this.state.html, this.state.point)
        this.custom.setOpacity(this.fade.value)

        return this.fade.isAnimating
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
            html: target ? this.getTemplateHtml(target) : null
        }

        return this.scan
    }

    private static isScanCurrent(scan: TooltipScan, queue: Queue, window: CanvasWindow, point: Point) {
        return !queue.isAnimating
               && scan.version === queue.version
               && samePoint(scan.point, point)
               && sameRect(scan.window, window)
    }

    private getTemplateHtml(target: RenderItem) {
        return this.template && target.data ? this.template(target.data) : null
    }
}