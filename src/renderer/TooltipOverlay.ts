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
import PointHelper from '@/helpers/PointHelper'
import Rectangle from '@/helpers/Rectangle'

type TooltipTarget = {
    template: string | null
    html: string | null
}

type TooltipScan = TooltipTarget & {
    point: Point
    version: number
    window: RectangleDimensions
}

type TextUpdate = Pick<Frame, 'now' | 'isInstant'>

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

        return this.updateHtml(mouse, this.getHtml(target, theme), { now, isInstant })
    }

    private getHtml(target: TooltipTarget, theme: ThemePalette) {
        if (target.html)
            return target.html

        return target.template ? CustomTooltip.fromText(target.template, theme) : null
    }

    private updateHtml(mouse: Point | null, html: string | null, { now, isInstant }: TextUpdate) {
        const isVisible = mouse != null && html != null

        if (isVisible)
            this.state = { point: mouse, html }
        else if (this.state && mouse)
            this.state = { point: mouse, html: this.state.html }

        this.fade.step(isVisible, now, Tooltip.fadeDuration, isInstant)

        if (!this.state || !isVisible && this.fade.isIdle) {
            this.custom.hide()
            this.state = null

            return false
        }

        this.custom.show(this.state.html, this.state.point)
        this.custom.setAppearProgress(this.fade.value)

        return this.fade.isAnimating
    }

    private getTarget(queue: Queue, window: CanvasWindow, point: Point): TooltipTarget {
        const scan = this.scan

        if (scan != null && TooltipOverlay.isScanCurrent(scan, queue, window, point))
            return scan

        const target = queue.findTooltip(point)

        this.scan = {
            point,
            version: queue.version,
            window: Rectangle.copy(window),
            template: target?.tooltipAt(point) ?? null,
            html: target ? this.getTemplateHtml(target, point) : null
        }

        return this.scan
    }

    private static isScanCurrent(scan: TooltipScan, queue: Queue, window: CanvasWindow, point: Point) {
        return !queue.isAnimating
               && scan.version === queue.version
               && PointHelper.same(scan.point, point)
               && Rectangle.same(scan.window, window)
    }

    private getTemplateHtml(target: RenderItem, point: Point) {
        const data = target.dataAt(point)

        return this.template && data ? this.template(data) : null
    }
}